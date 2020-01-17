'use strict';

const truncate = require('./truncate');

function convertToKeyValueFromSpec(spec, prop) {
  if (spec && prop in spec) {
    return Object.keys(spec[prop]).map((key) => {
      return { key, value: spec[prop][key] };
    });
  }
}

const serviceDefaults = {
  ExecStart: '/usr/bin/npm start',
  Restart: 'always',
  StandardOutput: 'syslog',
  StandardError: 'syslog'
};

function createServiceDefaults(spec = {}) {
  const combinedConfig = Object.assign(
    {},
    serviceDefaults,
    spec.serviceOptions
  );
  return convertToKeyValueFromSpec({ combinedConfig }, 'combinedConfig');
}

module.exports = function (pkg) {
  return Object.assign(
    {
      name: pkg.name,
      username: truncate(pkg.name),
      description: pkg.description,
      environment: convertToKeyValueFromSpec(pkg.spec, 'environment'),
      serviceOptions: createServiceDefaults(pkg.spec),
      unitOptions: convertToKeyValueFromSpec(pkg.spec, 'unitOptions')
    }
  );
};
