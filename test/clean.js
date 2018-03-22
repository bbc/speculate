'use strict';

const sinon = require('sinon');
const rimraf = require('rimraf');
const clean = require('../lib/clean');

const pkg = require('./fixtures/my-cool-api');
const sandbox = sinon.sandbox.create();

describe('clean', () => {
  beforeEach(() => {
    sandbox.stub(rimraf, 'sync');
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('removes the existing service file', () => {
    clean('/path/to/project', pkg);
    sinon.assert.calledWith(
      rimraf.sync,
      '/path/to/project/my-cool-api.service'
    );
  });

  it('removes the SPECS directory', () => {
    clean('/path/to/project', pkg);
    sinon.assert.calledWith(
      rimraf.sync,
      '/path/to/project/SPECS'
    );
  });

  it('removes the SOURCES directory', () => {
    clean('/path/to/project', pkg);
    sinon.assert.calledWith(
      rimraf.sync,
      '/path/to/project/SOURCES'
    );
  });
});
