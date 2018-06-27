'use strict';

const path = require('path');

module.exports = {
  serviceFileName: function (pkg) {
    return `${pkg.name}.service`;
  },
  serviceFile: function (root, pkg) {
    return path.resolve(root, this.serviceFileName(pkg));
  },
  specsDirectory: function (root) {
    return path.resolve(root, 'SPECS');
  },
  specFile: function (root, pkg) {
    return path.resolve(root, pkg.name + '.spec');
  },
  sourcesDirectory: function (root) {
    return path.resolve(root, 'SOURCES');
  },
  sourcesArchive: function (root, pkg) {
    const sourcesDirectory = this.sourcesDirectory(root);

    return path.resolve(sourcesDirectory, pkg.name + '.tar.gz');
  }
};
