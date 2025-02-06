'use strict';

module.exports = function (spec, key, fallback) {
  if (spec && key in spec) {
    return spec[key];
  }

  return fallback;
};
