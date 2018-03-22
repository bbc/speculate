'use strict';

const hogan = require('hogan.js');
const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const getServiceProperties = require('./serviceProperties');

const templateFile = fs.readFileSync(path.resolve(__dirname, '../templates/spec.mustache'), 'utf-8');
const template = hogan.compile(templateFile);

const defaultRelease = 1;

function getReleaseNumber(release) {
  if (release) {
    return release;
  }

  return defaultRelease;
}

function getRequiredBuildPackages(pkg) {
  return _.get(pkg, 'spec.buildRequires', []);
}

function getRequiredPackages(pkg) {
  return _.get(pkg, 'spec.requires', []);
}

function getNodeVersion(pkg) {
  return _.get(pkg, 'spec.nodeVersion');
}

function getExecutableFiles(pkg) {
  const name = pkg.name;
  const executableFiles = _.get(pkg, 'spec.executable', []).map((file) => {
    return path.join('/usr/lib/', name, file);
  });

  return {
    executableFiles,
    hasExecutableFiles: executableFiles.length !== 0
  };
}

function getPostInstallCommands(pkg) {
  return _.get(pkg, 'spec.post', []);
}

function shouldPrune(pkg) {
  return _.get(pkg, 'spec.prune', true);
}

module.exports = function (pkg, release) {
  const serviceProperties = _.assign({
    release: getReleaseNumber(release),
    requires: getRequiredPackages(pkg),
    buildRequires: getRequiredBuildPackages(pkg),
    postInstallCommands: getPostInstallCommands(pkg),
    nodeVersion: getNodeVersion(pkg),
    version: pkg.version,
    license: pkg.license,
    prune: shouldPrune(pkg)
  },
  getExecutableFiles(pkg),
  getServiceProperties(pkg)
  );

  return template.render(serviceProperties);
};
