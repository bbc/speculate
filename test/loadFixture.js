'use strict';

const fs = require('fs');
const path = require('path');

module.exports = function loadFixture(fixtureName) {
  const fixtureFile = path.join(__dirname, './fixtures/', fixtureName);

  return fs.readFileSync(fixtureFile, 'utf-8');
};
