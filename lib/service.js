'use strict';

const handlebars = require('handlebars');
const fs = require('fs');
const path = require('path');
const getServiceProperties = require('./serviceProperties');

const templateFile = fs.readFileSync(path.resolve(__dirname, '../templates/service.hbs'), 'utf-8');
const template = handlebars.compile(templateFile);

module.exports = function (pkg) {
  const serviceProperties = getServiceProperties(pkg);
  return template(serviceProperties);
};
