'use strict';

const path = require('path');

module.exports = function (projectDirectory) {
  try {
    require(path.resolve(projectDirectory, 'spec.json'));
    return true;
  } catch (e) {
    return false;
  }
};
