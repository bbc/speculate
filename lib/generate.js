'use strict';

const fs = require('fs');
const path = require('path');

const archiver = require('./archiver');
const createServiceFile = require('./service');
const createSpecFile = require('./spec');
const files = require('./files');

function generateServiceFile(root, pkg) {
  const serviceFileContents = createServiceFile(pkg);
  const serviceFilePath = files.serviceFile(root, pkg);

  fs.writeFileSync(serviceFilePath, serviceFileContents);

  return serviceFilePath;
}

function generateSpecFile(root, pkg, release) {
  const specFileContents = createSpecFile(pkg, release);
  const specFilePath = files.specFile(root, pkg);

  fs.writeFileSync(specFilePath, specFileContents);

  return specFilePath;
}

function addCustomFieldsToPackage(pkg, customName) {
  if (customName) {
    return Object.assign({}, pkg, { name: customName });
  }

  return pkg;
}

function relativeToRoot(root, files) {
  return files.map((file) => {
    return path.relative(root, file);
  });
}

function getArchiveWhitelist(pkg) {
  return {
    service: files.serviceFileName(pkg),
    main: pkg.main,
    files: pkg.files
  };
}

module.exports = async (root, pkg, release, customName) => {
  const customPackage = addCustomFieldsToPackage(pkg, customName);
  const specsDirectory = files.specsDirectory(root);
  const sourcesDirectory = files.sourcesDirectory(root);
  const sourcesArchive = files.sourcesArchive(root, customPackage);

  fs.mkdirSync(specsDirectory);
  fs.mkdirSync(sourcesDirectory);

  const serviceFile = generateServiceFile(root, customPackage);
  const specFile = generateSpecFile(specsDirectory, customPackage, release);
  const archiveWhitelist = getArchiveWhitelist(customPackage);

  await archiver.compress(root, sourcesArchive, archiveWhitelist);

  return relativeToRoot(root, [
    specFile,
    sourcesArchive,
    serviceFile
  ]);
};
