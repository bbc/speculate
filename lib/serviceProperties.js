'use strict';

const truncate = require('./truncate');

const defaultServiceProperties = {
  environment: {},
  serviceOptions: {
    ExecStart: '/usr/bin/node --run start'
  },
  unitOptions: {}
};

function convertToKeyValueFromSpec(spec, prop) {
  return Object.entries(Object.assign({}, defaultServiceProperties[prop], spec && spec[prop] || {})).map(([key, value]) => {
    return { key, value };
  });
}

module.exports = function (pkg) {
  return Object.assign(
    {
      name: pkg.name,
      username: truncate(pkg.name),
      description: pkg.description,
      environment: convertToKeyValueFromSpec(pkg.spec, 'environment'),
      serviceOptions: convertToKeyValueFromSpec(pkg.spec, 'serviceOptions'),
      unitOptions: convertToKeyValueFromSpec(pkg.spec, 'unitOptions')
    }
  );
};
