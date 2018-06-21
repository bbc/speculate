'use strict';

const truncate = require('./truncate');

function convertToKeyValueFromSpec(spec, prop) {
  if (spec && prop in spec) {
    return Object.keys(spec[prop]).map((key) => {
      return { key, value: spec[prop][key] };
    });
  }
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
