var createSpecFile = require('../lib/spec');
var assert = require('assert');
var loadFixture = require('./loadFixture');

describe('spec', function () {
  it('creates a spec file from a package.json', function () {
    var pkg = require('./fixtures/my-cool-api');
    var expected = loadFixture('my-cool-api.spec');
    var spec = createSpecFile(pkg);

    assert.equal(spec, expected);
  });

  it('truncates the service name if over the Linux username character limit', function () {
    var pkg = require('./fixtures/my-super-long-long-long-long-cat-api');
    var expected = loadFixture('my-super-long-long-long-long-cat-api.spec');
    var spec = createSpecFile(pkg);

    assert.equal(spec, expected);
  });

  it('removes the prune step when specified', function () {
    var pkg = require('./fixtures/my-cool-api-no-prune');
    var expected = loadFixture('my-cool-api-no-prune.spec');
    var spec = createSpecFile(pkg);

    assert.equal(spec, expected);
  });

  it('sets npm rebuild args when specified', function () {
    var pkg = require('./fixtures/my-cool-api-with-npm-rebuild-args.json');
    var expected = loadFixture('my-cool-api-with-npm-rebuild-args.spec');
    var spec = createSpecFile(pkg);

    assert.equal(spec, expected);
  });

  it('sets the release number when specified', function () {
    var releaseNumber = 7;
    var pkg = require('./fixtures/my-cool-api');
    var expected = loadFixture('my-cool-api-7.spec');
    var spec = createSpecFile(pkg, releaseNumber);

    assert.equal(spec, expected);
  });

  it('requires a particular node version when specified', function () {
    var pkg = require('./fixtures/my-cool-api-with-node-version');
    var expected = loadFixture('my-cool-api-with-node-version.spec');
    var spec = createSpecFile(pkg);

    assert.equal(spec, expected);
  });

  it('adds all of the required packages from the spec.requires property in package.json', function () {
    var pkg = require('./fixtures/my-cool-api-with-requires');
    var expected = loadFixture('my-cool-api-with-requires.spec');
    var spec = createSpecFile(pkg);

    assert.equal(spec, expected);
  });

  it('adds all of the required packages from the spec.buildRequires property in package.json', function () {
    var pkg = require('./fixtures/my-cool-api-with-buildrequires');
    var expected = loadFixture('my-cool-api-with-buildrequires.spec');
    var spec = createSpecFile(pkg);

    assert.equal(spec, expected);
  });

  it('adds all of the executable files from the spec.executable property in package.json', function () {
    var pkg = require('./fixtures/my-cool-api-with-executable');
    var expected = loadFixture('my-cool-api-with-executable.spec');
    var spec = createSpecFile(pkg);

    assert.equal(spec, expected);
  });

  it('includes post-install actions from the spec.post property in package.json', function () {
    var pkg = require('./fixtures/my-cool-api-with-post');
    var expected = loadFixture('my-cool-api-with-post.spec');
    var spec = createSpecFile(pkg);
    assert.equal(spec, expected);
  });

  it('sets the license from the package.json', function () {
    var pkg = require('./fixtures/my-cool-api-with-diff-licence');
    var expected = loadFixture('my-cool-api-with-diff-licence.spec');
    var spec = createSpecFile(pkg);
    assert.equal(spec, expected);
  });

  it('avoid escaping the Requires and Buildrequires', function () {
    var pkg = require('./fixtures/my-cool-api-with-requires-noescape.json');
    var expected = loadFixture('my-cool-api-with-requires-noescape.spec');
    var spec = createSpecFile(pkg);
    assert.equal(spec, expected);
  });
});
