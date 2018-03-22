'use strict';

const path = require('path');

module.exports = function (projectDirectory) {
  try {
    require(path.resolve(projectDirectory, 'package.json'));
    return true;
  } catch (e) {
    return false;
  }
};
