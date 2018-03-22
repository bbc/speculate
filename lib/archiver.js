'use strict';

const tar = require('tar-fs');
const fs = require('fs');
const zlib = require('zlib');
const path = require('path');

const IGNORE_REGEX = /SOURCES|SPECS|RPMS|SRPMS|\.git/;

module.exports.compress = async function (source, target) {
  const gzip = zlib.createGzip();
  const ws = fs.createWriteStream(target);
  const rs = tar.pack(source, {
    ignore: function (name) {
      return IGNORE_REGEX.test(path.relative(source, name));
    }
  });

  return new Promise((resolve, reject) => {
    rs.on('error', reject);
    ws.on('error', reject);
    ws.on('close', resolve);

    rs.pipe(gzip).pipe(ws);
  });
};
