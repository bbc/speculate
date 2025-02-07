'use strict';

const semver = require('semver');
const truncate = require('./truncate');
const getValueFromSpec = require('./getValueFromSpec');

function convertToKeyValueFromSpec(spec, prop) {
  if (spec && prop in spec) {
    return Object.keys(spec[prop]).map((key) => {
      return { key, value: spec[prop][key] };
    });
  }
}

function getExecFromSpec(spec) {
  const nodeVersion = getValueFromSpec(spec, 'nodeVersion');
  if (!nodeVersion) {
    return '/usr/bin/npm';
  }

  const nodeSemVer = nodeVersion.replace(/\d*\:/, '');

  if (semver.minVersion(nodeSemVer).major >= 22) {
    return '/usr/bin/node --run';
  }

  return '/usr/bin/npm';

}

module.exports = function (pkg) {
  return Object.assign(
    {
      name: pkg.name,
      username: truncate(pkg.name),
      description: pkg.description,
      environment: convertToKeyValueFromSpec(pkg.spec, 'environment'),
      execCommand: getExecFromSpec(pkg.spec),
      serviceOptions: convertToKeyValueFromSpec(pkg.spec, 'serviceOptions'),
      unitOptions: convertToKeyValueFromSpec(pkg.spec, 'unitOptions')
    }
  );
};
