'use strict';

const _ = require('lodash');
const tar = require('tar-fs');
const fs = require('fs');
const zlib = require('zlib');
const path = require('path');

const IGNORE_REGEX = /SOURCES|SPECS|RPMS|SRPMS|\.git/;
const REQUIRED_ENTRIES = [
  'package.json',
  'node_modules'
];

function getEntries(whitelist) {
  if (whitelist.files) {
    const whitelistSections = _.pick(whitelist, ['main', 'files']);
    const whitelistFromSections = _.reduce(whitelistSections, (whitelist, current) => {
      if (current) {
        return _.concat(whitelist, current);
      }

      return whitelist;
    }, []);

    if (!whitelistFromSections.length) {
      return;
    }

    return _.concat(REQUIRED_ENTRIES, whitelistFromSections);
  }
}

module.exports.compress = async function (source, target, whitelist) {
  const gzip = zlib.createGzip();
  const ws = fs.createWriteStream(target);
  const rs = tar.pack(source, {
    ignore: function (name) {
      return IGNORE_REGEX.test(path.relative(source, name));
    },
    entries: getEntries(whitelist)
  });

  return new Promise((resolve, reject) => {
    rs.on('error', reject);
    ws.on('error', reject);
    ws.on('close', resolve);

    rs.pipe(gzip).pipe(ws);
  });
};
