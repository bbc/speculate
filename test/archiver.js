var _ = require('lodash');
var fs = require('fs');
var tar = require('tar-fs');
var zlib = require('zlib');
var stream = require('stream');
var assert = require('assert');
var sinon = require('sinon');
var sandbox = sinon.sandbox.create();

var archiver = require('../lib/archiver');

describe('archiver', function () {
  var writeStream;
  var readStream;
  var transformStream;

  beforeEach(function () {
    writeStream = new stream.Writable();
    readStream = new stream.Readable();
    transformStream = new stream.Transform();

    readStream._read = _.noop;
    transformStream._read = _.noop;

    sandbox.stub(fs, 'createWriteStream').returns(writeStream);
    sandbox.stub(zlib, 'createGzip').returns(transformStream);
    sandbox.stub(tar, 'pack').returns(readStream);
  });

  afterEach(function () {
    sandbox.restore();
  });

  it('creates a tar.gz archive', function (done) {
    archiver.compress('tmp', 'tmp.tar.gz', function (err) {
      assert.ifError(err);
      done();
    });

    writeStream.emit('close');
  });

  it('returns an error when the archive cannot be written', function (done) {
    archiver.compress('tmp', 'tmp.tar.gz', function (err) {
      assert.ok(err);
      done();
    });

    writeStream.emit('error', new Error('An error occured'));
  });

  it('ignores build artifacts', function (done) {
    archiver.compress('tmp', 'tmp.tar.gz', function (err) {
      assert.ifError(err);
      sinon.assert.calledWith(tar.pack, 'tmp', sinon.match.object);
      var ignore = tar.pack.getCall(0).args[1].ignore;
      assert.equal(ignore('SPECS'), true);
      assert.equal(ignore('SOURCES'), true);
      assert.equal(ignore('RPMS'), true);
      assert.equal(ignore('SRPMS'), true);
      assert.equal(ignore('.git/objects/00'), true);
      done();
    });

    writeStream.emit('close');
  });

  it('does not ignore all artifacts because of full path name', function (done) {
    archiver.compress('/tmp/SOURCES', 'tmp.tar.gz', function (err) {
      assert.ifError(err);
      var ignore = tar.pack.getCall(0).args[1].ignore;
      assert.equal(ignore('/tmp/SOURCES/cake/real_file_here'), false);
      done();
    });

    writeStream.emit('close');
  });
});
