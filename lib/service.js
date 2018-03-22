'use strict';

const hogan = require('hogan.js');
const fs = require('fs');
const path = require('path');
const getServiceProperties = require('./serviceProperties');

const templateFile = fs.readFileSync(path.resolve(__dirname, '../templates/service.mustache'), 'utf-8');
const template = hogan.compile(templateFile);

module.exports = function (pkg) {
  const serviceProperties = getServiceProperties(pkg);

  return template.render(serviceProperties);
};
