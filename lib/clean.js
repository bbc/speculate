'use strict';

const rimraf = require('rimraf');

const files = require('./files');

module.exports = function (root, pkg) {
  const serviceFilePath = files.serviceFile(root, pkg);
  const specsDirectory = files.specsDirectory(root);
  const sourcesDirectory = files.sourcesDirectory(root);

  rimraf.sync(serviceFilePath);
  rimraf.sync(specsDirectory);
  rimraf.sync(sourcesDirectory);
};
