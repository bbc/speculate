'use strict';

const createServiceFile = require('../lib/service');
const assert = require('assert');
const loadFixture = require('./loadFixture');

describe('service', () => {
  it('creates a service file from a package.json', () => {
    const pkg = require('./fixtures/my-cool-api');
    const expected = loadFixture('my-cool-api.service');
    const service = createServiceFile(pkg);

    assert.equal(service, expected);
  });

  it('truncates the service name if over the Linux username character limit', () => {
    const pkg = require('./fixtures/my-super-long-long-long-long-cat-api');
    const expected = loadFixture('my-super-long-long-long-long-cat-api.service');
    const service = createServiceFile(pkg);

    assert.equal(service, expected);
  });

  it('includes environment constiables from the spec.environment property in package.json', () => {
    const pkg = require('./fixtures/my-cool-api-environment');
    const expected = loadFixture('my-cool-api-environment.service');
    const service = createServiceFile(pkg);

    assert.equal(service, expected);
  });

  it('includes service options from the spec.serviceOptions property in package.json', () => {
    const pkg = require('./fixtures/my-cool-api-with-service-options');
    const expected = loadFixture('my-cool-api-with-service-options.service');
    const service = createServiceFile(pkg);

    assert.equal(service, expected);
  });

  it('incudes unit options from the spec.unitOptions property in the package.json', () => {
    const pkg = require('./fixtures/my-cool-api-with-unit-options');
    const expected = loadFixture('my-cool-api-with-unit-options.service');
    const service = createServiceFile(pkg);

    assert.equal(service, expected);
  });
});
