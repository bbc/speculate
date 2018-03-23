'use strict';

const pkg = require('./fixtures/my-cool-api');
const pkgWithWhitelist = require('./fixtures/my-cool-api-with-whitelist');
const sandbox = require('sinon').sandbox.create();
const fs = require('fs');
const assert = require('assert');
const generate = require('../lib/generate');
const archiver = require('../lib/archiver');

describe('generate', () => {
  beforeEach(() =>{
    sandbox.stub(fs, 'writeFileSync');
    sandbox.stub(fs, 'mkdirSync');
    sandbox.stub(archiver, 'compress').returns(Promise.resolve());
  });

  afterEach(() =>{
    sandbox.restore();
  });

  it('creates the service file', async () => {
    await generate('/path/to/project', pkg, null, null);
    sandbox.assert.calledWith(
      fs.writeFileSync,
      '/path/to/project/my-cool-api.service',
      sandbox.match('SyslogIdentifier=my-cool-api')
    );
  });

  it('creates directory for SPECS', async () => {
    await generate('/path/to/project', pkg, null, null);
    sandbox.assert.calledWith(fs.mkdirSync, '/path/to/project/SPECS');
  });

  it('fails if it cannot create directory for SPECS', async () => {
    fs.mkdirSync.withArgs('/path/to/project/SPECS').throws();

    try {
      await generate('/path/to/project', pkg, null, null);
    } catch (e) {
      return assert.ok(e);
    }

    assert.fail();
  });

  it('creates the spec file', async () => {
    await generate('/path/to/project', pkg, null, null);
    sandbox.assert.calledWith(
      fs.writeFileSync,
      '/path/to/project/SPECS/my-cool-api.spec',
      sandbox.match('%define name my-cool-api')
    );
  });

  it('creates the sources archive', async () => {
    await generate('/path/to/project', pkg, null, null);
    sandbox.assert.calledWith(
      archiver.compress,
      '/path/to/project',
      '/path/to/project/SOURCES/my-cool-api.tar.gz',
      {
        main: 'index.js'
      }
    );
  });

  it('creates directory for SOURCES', async () => {
    await generate('/path/to/project', pkg, null, null);
    sandbox.assert.calledWith(fs.mkdirSync, '/path/to/project/SOURCES');
  });

  it('fails if it cannot create directory for SOURCES', async () => {
    fs.mkdirSync.withArgs('/path/to/project/SOURCES').throws();

    try {
      await generate('/path/to/project', pkg, null, null);
    } catch (e) {
      return assert.ok(e);
    }

    assert.fail();
  });

  it('creates the spec file with the correct release number', async () => {
    await generate('/path/to/project', pkg, 7, null);
    sandbox.assert.calledWith(
      fs.writeFileSync,
      '/path/to/project/SPECS/my-cool-api.spec',
      sandbox.match('%define release 7')
    );
  });

  it('creates the spec file with a custom name if specified', async () => {
    await generate('/path/to/project', pkg, 1, 'penguin');
    sandbox.assert.calledWith(
      fs.writeFileSync,
      '/path/to/project/SPECS/penguin.spec',
      sandbox.match('%define name penguin')
    );
  });

  it('creates the sources archive with a custom name if specified', async () => {
    await generate('/path/to/project', pkg, null, 'penguin');
    sandbox.assert.calledWith(
      archiver.compress,
      '/path/to/project',
      '/path/to/project/SOURCES/penguin.tar.gz',
      {
        main: 'index.js'
      }
    );
  });

  it('passes files and main values from the package.json to archiver', async () => {
    await generate('/path/to/project', pkgWithWhitelist, null, null);
    sandbox.assert.calledWith(
      archiver.compress,
      '/path/to/project',
      '/path/to/project/SOURCES/my-cool-api.tar.gz',
      {
        main: 'server.js',
        files: [
          'lib',
          'routes',
          'index.js'
        ]
      }
    );
  });

  it('creates the service file with a custom name if specified', async () => {
    await generate('/path/to/project', pkg, 1, 'penguin');
    sandbox.assert.calledWith(
      fs.writeFileSync,
      '/path/to/project/penguin.service',
      sandbox.match('SyslogIdentifier=penguin')
    );
  });

  it('creates the sources archive with a custom name if specified', async () => {
    await generate('/path/to/project', pkg, null, 'penguin');
    sandbox.assert.calledWith(
      archiver.compress,
      '/path/to/project',
      '/path/to/project/SOURCES/penguin.tar.gz'
    );
  });

  it('returns an array of files created', async () => {
    const filesExpected = ['SPECS/my-cool-api.spec', 'SOURCES/my-cool-api.tar.gz', 'my-cool-api.service'];
    const files = await generate('/path/to/project', pkg, null, null);
    assert.deepEqual(files, filesExpected);
  });

  it('fails if archiver fails', async () => {
    archiver.compress.returns(Promise.reject(new Error('Thanks Jim :-)')));

    try {
      await generate('/path/to/project', pkg, null, null);
    } catch (e) {
      return assert.ok(e);
    }

    assert.fail();
  });
});
