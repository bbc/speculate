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

function getEntries(allowlist) {
  if (allowlist.files) {
    // Extract the property from the allowlist
    const { service, main, files } = allowlist;
    const allowlistFromSections = [service];

    /*
     * It flattens the content of both properties (main and files) in the
     * "allowlistFromSections" array.
     */
    if (main) {
      allowlistFromSections.push(main);
    }

    if (files) {
      allowlistFromSections.push(...files);
    }

    if (!allowlistFromSections.length) {
      return;
    }

    return REQUIRED_ENTRIES.concat(allowlistFromSections);
  }
}

module.exports.compress = async function (source, target, allowlist) {
  const gzip = zlib.createGzip();
  const ws = fs.createWriteStream(target);
  const rs = tar.pack(source, {
    ignore: function (name) {
      return IGNORE_REGEX.test(path.relative(source, name));
    },
    entries: getEntries(allowlist)
  });

  return new Promise((resolve, reject) => {
    rs.on('error', reject);
    ws.on('error', reject);
    ws.on('close', resolve);

    rs.pipe(gzip).pipe(ws);
  });
};
