'use strict';

const truncate = require('./truncate');
const _ = require('lodash');

function getEnvironment(pkg) {
  const environment = _.get(pkg, 'spec.environment', {});
  return Object.keys(environment).map((key) => {
    return { key, value: environment[key] };
  });
}

function getServiceOptions(pkg) {
  const serviceOptions = _.get(pkg, 'spec.serviceOptions', {});
  return Object.keys(serviceOptions).map((key) => {
    return { key, value: serviceOptions[key] };
  });
}

module.exports = function (pkg) {
  return {
    name: pkg.name,
    username: truncate(pkg.name),
    description: pkg.description,
    environment: getEnvironment(pkg),
    serviceOptions: getServiceOptions(pkg)
  };
};
