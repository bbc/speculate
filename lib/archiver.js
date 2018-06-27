'use strict';

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
    // Extract the property from the whitelist
    const { service, main, files } = whitelist;
    const whitelistFromSections = [service];

    /*
     * It flattens the content of both properties (main and files) in the
     * "whitelistFromSections" array.
     */
    if (main) {
      whitelistFromSections.push(main);
    }

    if (files) {
      whitelistFromSections.push(...files);
    }

    if (!whitelistFromSections.length) {
      return;
    }

    return REQUIRED_ENTRIES.concat(whitelistFromSections);
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
