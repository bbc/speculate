'use strict';

const createSpecFile = require('../lib/spec');
const assert = require('assert');
const loadFixture = require('./loadFixture');

describe('spec', () => {
  it('creates a spec file from a package.json', () => {
    const pkg = require('./fixtures/my-cool-api');
    const expected = loadFixture('my-cool-api.spec');
    const spec = createSpecFile(pkg);

    assert.equal(spec, expected);
  });

  it('truncates the service name if over the Linux username character limit', () => {
    const pkg = require('./fixtures/my-super-long-long-long-long-cat-api');
    const expected = loadFixture('my-super-long-long-long-long-cat-api.spec');
    const spec = createSpecFile(pkg);

    assert.equal(spec, expected);
  });

  it('removes the prune step when specified', () => {
    const pkg = require('./fixtures/my-cool-api-no-prune');
    const expected = loadFixture('my-cool-api-no-prune.spec');
    const spec = createSpecFile(pkg);

    assert.equal(spec, expected);
  });

  it('removes the rebuild step when specified', () => {
    const pkg = require('./fixtures/my-cool-api-no-rebuild');
    const expected = loadFixture('my-cool-api-no-rebuild.spec');
    const spec = createSpecFile(pkg);

    assert.equal(spec, expected);
  });

  it('sets the release number when specified', () => {
    const releaseNumber = 7;
    const pkg = require('./fixtures/my-cool-api');
    const expected = loadFixture('my-cool-api-7.spec');
    const spec = createSpecFile(pkg, releaseNumber);

    assert.equal(spec, expected);
  });

  it('requires a particular node version when specified', () => {
    const pkg = require('./fixtures/my-cool-api-with-node-version');
    const expected = loadFixture('my-cool-api-with-node-version.spec');
    const spec = createSpecFile(pkg);

    assert.equal(spec, expected);
  });

  it('adds all of the required packages from the spec.requires property in package.json', () => {
    const pkg = require('./fixtures/my-cool-api-with-requires');
    const expected = loadFixture('my-cool-api-with-requires.spec');
    const spec = createSpecFile(pkg);

    assert.equal(spec, expected);
  });

  it('adds all of the required packages from the spec.buildRequires property in package.json', () => {
    const pkg = require('./fixtures/my-cool-api-with-buildrequires');
    const expected = loadFixture('my-cool-api-with-buildrequires.spec');
    const spec = createSpecFile(pkg);

    assert.equal(spec, expected);
  });

  it('adds all of the executable files from the spec.executable property in package.json', () => {
    const pkg = require('./fixtures/my-cool-api-with-executable');
    const expected = loadFixture('my-cool-api-with-executable.spec');
    const spec = createSpecFile(pkg);

    assert.equal(spec, expected);
  });

  it('includes post-install actions from the spec.post property in package.json', () => {
    const pkg = require('./fixtures/my-cool-api-with-post');
    const expected = loadFixture('my-cool-api-with-post.spec');
    const spec = createSpecFile(pkg);

    assert.equal(spec, expected);
  });

  it('sets the license from the package.json', () => {
    const pkg = require('./fixtures/my-cool-api-with-diff-licence');
    const expected = loadFixture('my-cool-api-with-diff-licence.spec');
    const spec = createSpecFile(pkg);

    assert.equal(spec, expected);
  });

  it('avoid escaping the Requires and Buildrequires', () => {
    const pkg = require('./fixtures/my-cool-api-with-requires-noescape.json');
    const expected = loadFixture('my-cool-api-with-requires-noescape.spec');
    const spec = createSpecFile(pkg);

    assert.equal(spec, expected);
  });

  it('replaces hyphens in the package version number with tildes if spec.replaceHyphens is true in package.json', () => {
    const pkg = require('./fixtures/my-cool-api-with-hyphenated-version-and-override.json');
    const expected = loadFixture(
      'my-cool-api-with-version-hyphens-replaced.spec'
    );
    const spec = createSpecFile(pkg);

    assert.equal(spec, expected);
  });

  it('replaces hyphens in the package version number with spec.replaceHyphens if it is a valid character', () => {
    const pkg = require('./fixtures/my-cool-api-with-hyphenated-version-and-override-underscore.json');
    const expected = loadFixture(
      'my-cool-api-with-version-hyphens-replaced-underscores.spec'
    );
    const spec = createSpecFile(pkg);

    assert.equal(spec, expected);
  });

  it('errors if spec.replaceHyphens is not a valid character', () => {
    const pkg = require('./fixtures/my-cool-api-with-hyphenated-version-and-override-underscore.json');
    pkg.spec.replaceHyphens = 'invalid';
    const erroringSpecCall = createSpecFile.bind(null, pkg);

    assert.throws(erroringSpecCall);
  });

  it('does not replace hyphens in the package version number if spec.replaceHyphens is not defined in package.json', () => {
    const pkg = require('./fixtures/my-cool-api-with-hyphenated-version.json');
    const expected = loadFixture('my-cool-api-with-hyphenated-version.spec');
    const spec = createSpecFile(pkg);

    assert.equal(spec, expected);
  });
});
