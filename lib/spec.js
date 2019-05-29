'use strict';

const handlebars = require('handlebars');
const fs = require('fs');
const path = require('path');
const getServiceProperties = require('./serviceProperties');

const templateFile = fs.readFileSync(path.resolve(__dirname, '../templates/spec.hbs'), 'utf-8');
const template = handlebars.compile(templateFile);

const defaultRelease = 1;

function getReleaseNumber(release) {
  if (release) {
    return release;
  }

  return defaultRelease;
}

function getVersionNumber({ spec, version }) {
  const replaceHyphens = getValueFromSpec(spec, 'replaceHyphens', false);

  return replaceHyphens ? version.replace(/-/g, '~') : version;
}

function getValueFromSpec(spec, key, fallback) {
  if (spec && key in spec) {
    return spec[key];
  }

  return fallback;
}

function getExecutableFiles(pkg) {
  const name = pkg.name;
  const executableFiles = getValueFromSpec(pkg.spec, 'executable', []).map((file) => {
    return path.join('/usr/lib/', name, file);
  });

  return {
    executableFiles,
    hasExecutableFiles: executableFiles.length !== 0
  };
}

module.exports = function (pkg, release) {
  const serviceProperties = Object.assign(
    {
      release: getReleaseNumber(release),
      requires: getValueFromSpec(pkg.spec, 'requires', []),
      buildRequires: getValueFromSpec(pkg.spec, 'buildRequires', []),
      postInstallCommands: getValueFromSpec(pkg.spec, 'post', []),
      nodeVersion: getValueFromSpec(pkg.spec, 'nodeVersion'),
      version: getVersionNumber(pkg),
      license: pkg.license,
      prune: getValueFromSpec(pkg.spec, 'prune', true),
      rebuild: getValueFromSpec(pkg.spec, 'rebuild', true)
    },
    getExecutableFiles(pkg),
    getServiceProperties(pkg)
  );

  return template(serviceProperties);
};
