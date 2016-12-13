var tar = require('tar-fs');
var fs = require('fs');
var zlib = require('zlib');
var path = require('path');

var IGNORE_REGEX = /SOURCES|SPECS|RPMS|SRPMS|\.git/;

module.exports.compress = function (source, target, cb) {
  var gzip = zlib.createGzip();
  var ws = fs.createWriteStream(target);
  var rs = tar.pack(source, {
    ignore: function (name) {
      return IGNORE_REGEX.test(name);
    }
  });

  rs.on('error', cb);
  ws.on('error', cb);
  ws.on('close', cb);

  rs.pipe(gzip).pipe(ws);
};
