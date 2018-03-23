'use strict';

const _ = require('lodash');
const fs = require('fs');
const tar = require('tar-fs');
const zlib = require('zlib');
const stream = require('stream');
const assert = require('assert');
const sinon = require('sinon');
const sandbox = sinon.sandbox.create();

const archiver = require('../lib/archiver');

describe('archiver', () => {
  let writeStream;
  let readStream;
  let transformStream;

  beforeEach(() =>{
    writeStream = new stream.Writable();
    readStream = new stream.Readable();
    transformStream = new stream.Transform();

    readStream._read = _.noop;
    transformStream._read = _.noop;

    sandbox.stub(fs, 'createWriteStream').returns(writeStream);
    sandbox.stub(zlib, 'createGzip').returns(transformStream);
    sandbox.stub(tar, 'pack').returns(readStream);
  });

  afterEach(() =>{
    sandbox.restore();
  });

  it('creates a tar.gz archive', async () => {
    const result = archiver.compress('tmp', 'tmp.tar.gz', {});
    writeStream.emit('close');
    await result;
  });

  it('returns an error when the archive cannot be written', async () => {
    const result = archiver.compress('tmp', 'tmp.tar.gz', {});
    writeStream.emit('error', new Error('An error occured'));

    try {
      await result;
      assert.fail();
    } catch (err) {
      assert.ok(err);
    }
  });

  it('ignores build artifacts', async () => {
    const result = archiver.compress('tmp', 'tmp.tar.gz', {});
    writeStream.emit('close');

    await result;

    sinon.assert.calledWith(tar.pack, 'tmp', sinon.match.object);
    const ignore = tar.pack.getCall(0).args[1].ignore;
    assert.equal(ignore('SPECS'), true);
    assert.equal(ignore('SOURCES'), true);
    assert.equal(ignore('RPMS'), true);
    assert.equal(ignore('SRPMS'), true);
    assert.equal(ignore('.git/objects/00'), true);
  });

  it('does not ignore all artifacts because of full path name', async () => {
    const result = archiver.compress('/tmp/SOURCES', 'tmp.tar.gz', {});
    writeStream.emit('close');

    await result;

    const ignore = tar.pack.getCall(0).args[1].ignore;
    assert.equal(ignore('/tmp/SOURCES/cake/real_file_here'), false);
  });

  it('archives files on a whitelist if specified alongside required files', async () => {
    const files = [
      'lib',
      'routes',
      'index.js'
    ];
    const result = archiver.compress('/tmp/SOURCES', 'tmp.tar.gz', { files });
    writeStream.emit('close');

    await result;

    sandbox.assert.calledWith(tar.pack, '/tmp/SOURCES', sinon.match({
      entries: [
        'package.json',
        'node_modules',
        'lib',
        'routes',
        'index.js'
      ]
    }));
  });

  it('does not include whitelist if none specified', async () => {
    const result = archiver.compress('/tmp/SOURCES', 'tmp.tar.gz', {});
    writeStream.emit('close');

    await result;

    sandbox.assert.calledWith(tar.pack, '/tmp/SOURCES', sinon.match({
      entries: undefined
    }));
  });

  it('adds the "main" file to the archive alongside "files" if specified', async () => {
    const main = 'server.js';
    const files = [
      'lib',
      'routes',
      'index.js'
    ];
    const result = archiver.compress('/tmp/SOURCES', 'tmp.tar.gz', { main, files });
    writeStream.emit('close');

    await result;

    sandbox.assert.neverCalledWith(tar.pack, sinon.match({ ignore: sinon.match.func }));
    sandbox.assert.calledWith(tar.pack, '/tmp/SOURCES', sinon.match({
      entries: [
        'package.json',
        'node_modules',
        'server.js',
        'lib',
        'routes',
        'index.js'
      ]
    }));
  });

  it('archives everything if only the "main" is specified', async () => {
    const main = 'server.js';
    const result = archiver.compress('/tmp/SOURCES', 'tmp.tar.gz', { main });
    writeStream.emit('close');

    await result;

    sandbox.assert.neverCalledWith(tar.pack, sinon.match({ ignore: sinon.match.func }));
    sandbox.assert.calledWith(tar.pack, '/tmp/SOURCES', sinon.match({
      entries: undefined
    }));
  });
});
