'use strict';

const validator = require('../lib/validator');
const assert = require('assert');
const path = require('path');

describe('validator', () => {
  it('returns true with there is a valid package.json in the working directory', () => {
    const isValid = validator(path.resolve(__dirname, './fixtures/project-with-package-json'));

    assert.strictEqual(isValid, true);
  });

  it('returns false with there is no package.json in the working directory', () => {
    const isValid = validator(path.resolve(__dirname, './fixtures/project-without-package-json'));

    assert.strictEqual(isValid, false);
  });

  it('returns false with there is no valid package.json in the working directory', () => {
    const isValid = validator(path.resolve(__dirname, './fixtures/project-with-invalid-package-json'));

    assert.strictEqual(isValid, false);
  });
});
