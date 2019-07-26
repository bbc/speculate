# speculate

[![Build Status](https://travis-ci.org/bbc/speculate.svg)](https://travis-ci.org/bbc/speculate) [![Code Climate](https://codeclimate.com/github/bbc/speculate/badges/gpa.svg)](https://codeclimate.com/github/bbc/speculate) [![Test Coverage](https://codeclimate.com/github/bbc/speculate/badges/coverage.svg)](https://codeclimate.com/github/bbc/speculate/coverage)

> Automatically generates an RPM Spec file for your Node.js project

## Installation

```
npm install --global speculate
```

## Features

* Generates an RPM Spec file for your project
* Creates a [systemd](https://www.freedesktop.org/wiki/Software/systemd/) service definition file
* Supports configuration using your existing `package.json`
* Currently supports CentOS 7

## Usage

Let's start with a simple Node.js project:

```
my-cool-api
├── package.json
└── server.js

0 directories, 2 files
```

First run npm install to install your dependencies:

```
npm install
```

This creates the `node_modules` directory:

```
my-cool-api
├── node_modules
├── package.json
└── server.js

1 directory, 2 files
```

Run the `speculate` command from inside the project directory:

```
speculate
```

You've now got an RPM Spec file and a systemd service definition for your project. You'll also notice that your application has been packaged into a `tar.gz` archive, ready to be built with an RPM building tool like [`rpmbuild`](http://www.rpm.org/max-rpm-snapshot/rpmbuild.8.html) or [`mock`](https://github.com/rpm-software-management/mock/wiki):

```
my-cool-api
├── SOURCES
│   └── my-cool-api.tar.gz
├── SPECS
│   └── my-cool-api.spec
├── node_modules
├── my-cool-api.service
├── package.json
└── server.js

3 directories, 5 files
```

Speculate is designed to be used at build time, just before you package your application into an RPM. Because of this, we recommend adding the generated files to your `.gitignore` file:

```
*.service
SOURCES
SPECS
```

### Install your dependencies _first_

Speculate assumes that you've _already installed your npm dependencies_ when it is run. This means that you don't need to worry about running `npm install` inside a clean RPM-building environment like _mock_.

The generated spec file instructs your RPM building tool to run [`npm rebuild`](https://docs.npmjs.com/cli/rebuild) as part of the build process. This ensures that any native modules are rebuilt for your target environment, even if they were originally installed on a different platform.

If for some reason you do not want to rebuild your native modules, you can explicity tell speculate not to rebuild by adding the following to your `package.json`:

```json
{
  "spec": {
    "rebuild": false
  }
}
```

A typical speculate build looks like this:

```bash
npm install
npm test
speculate
# build the RPM (using rpmbuild, mock etc.)
```

### Local installation

To avoid the need to install speculate globally, we recommend installing it _locally_ and creating an [npm script](https://docs.npmjs.com/misc/scripts) in your `package.json` file:

```
npm install --save-dev speculate
```

```json
{
  "scripts": {
    "spec": "speculate"
  }
}
```

You can then run `npm run spec` to generate your spec file in an environment where speculate isn't installed globally (like your CI server.)

### Pruning dependencies

To minimise the final RPM size, your development dependencies (dependencies added with the --save-dev flag) are automatically [pruned](https://docs.npmjs.com/cli/prune) so that they're not shipped with your production code.

If for some reason you need to package your dev dependencies with your production code you can explicity tell speculate not to prune by adding the following to your `package.json`:

```json
{
  "spec": {
    "prune": false
  }
}
```

### `npm start` script

The systemd service file that Speculate generates uses the `npm start` script to start your application. Make sure that you've defined this script in your `package.json` file.

```json
{
  "scripts": {
    "start": "node server.js"
  }
}
```

### Including only certain files

Similar to `npm`, if you specify a `files` directive in your `package.json` then `speculate` will only include those files or directories plus `package.json` and `node_modules` in the source tarball:

```json
{
  "files": [
    "lib",
    "routes",
    "index.js"
  ]
}
```

Alongside this, the `main` attribute is also included in the `files` listing, although the service is still started using `npm start`:

```json
{
  "main": "server.js",
  "files": [
    "lib",
    "routes",
    "index.js"
  ]
}
```

If you have only a `main` directive, speculate will assume you are using it for its original purpose and not create an archive only including that one file.

### Node versions

By default, the spec file that speculate generates _isn't_ tied to a particular Node version. It simply requires the `nodejs` package. It's up to you to make the package available when you install the RPM using `yum`.

We **strongly recommend** that you use the [Nodesource binary distributions](https://github.com/nodesource/distributions) to install a modern version of Node.js for both your RPM building environment and your target server. Follow the setup instructions for [Enterprise Linux](https://github.com/nodesource/distributions#rpm) and then run `yum install nodejs`.

If you're using multiple node repositories or a repository with multiple versions of node, you can specify an RPM version requirement with the `nodeVersion` property in your `package.json` file:

```json
{
  "spec": {
    "nodeVersion": "< 5.0.0"
  }
}
```
The `nodeVersion` property must conform to the [RPM version syntax](http://rpm.org/user_doc/dependencies.html#requires). Take particular note of the `epoch` (`[epoch:]version[-release]`) as a range without an epoch may not result in the desired dependency:

```shell
"nodeVersion": "< 7.0.0"
---
Available Packages
nodejs.x86_64                             6.2.2-1nodesource.el7.centos          nodesource # <- matches as no epoch specified
nodejs.x86_64                             1:6.3.0-1nodesource.el7.centos        nodesource
nodejs.x86_64                             2:6.11.0-1nodesource.el7.centos       nodesource # <- Latest but epoch of '2'
```

### Directory Structure

Speculate creates the following directories for your application:

|Directory|Purpose|
|---------|-------|
|`/usr/lib/:projectName`|This is where your application is stored|
|`/var/log/:projectName`|This is created for any log files that your application needs to write to|

## Configuration

Speculate is configured using the `spec` property inside your existing `package.json` file.

### Dependencies

To add a dependency to the generated spec file, list the package dependencies in the `requires` array:

```json
{
  "spec": {
    "requires": [
      "vim",
      "screen"
    ]
  }
}
```

If you have any build dependencies (such as `python` for `node-gyp`), instead of having them available outside the build environment you can instead add them to the `buildRequires` array:

```json
{
  "spec": {
    "buildRequires": [
      "python"
    ]
  }
}
```

### Executables

If you have scripts that need to be executable when they're installed on your target server, add them to the `executable` array. You can list both files and entire directories:

```json
{
  "spec": {
    "executable": [
      "./other-scripts/my-script.js",
      "./scripts"
    ]
  }
}
```

### Post Install Actions

If you need to perform any actions after installing your package (such as moving files on the target server) you can specify these inline using the `post` property:

```json
{
  "spec": {
    "post": [
      "mv /usr/lib/my-cool-api/rc.local /etc/rc.local"
    ]
  }
}
```

### Environment variable

If you need to specify environment variables during startup (NODE_ENV for example) you can specify these inline using the spec.environment property:

```json
{
  "spec": {
    "environment": {
      "NODE_ENV": "production",
      "NODE_INSTANCE": "%i"
    }
  }
}
```

### Service Options

If you need to set specific [systemd service options](https://www.freedesktop.org/software/systemd/man/systemd.exec.html) - in the  `[Service]` section of the .service file, you can specify these using the spec.serviceOptions property:

```json
{
  "spec": {
    "serviceOptions": {
      "CPUSchedulingPriority": 50,
      "LimitNOFILE": 10000
    }
  }
}
```

#### Unit Options

You can set specific [systemd unit options](https://www.freedesktop.org/software/systemd/man/systemd.unit.html) - in the `[Unit]` section of the .service file, you can specify these using the spec.unitOptions property:

```json
{
  "spec": {
    "unitOptions": {
      "After": "my-cooler-api.service",
      "Before": "my-coolest-api.service",
      "Requires": "my-very-cool-api.service",
    }
  }
}
```

If you do not require any specific unit options Speculate will use default options:
```
[Unit]
Description=My Cool API
After=network.target nss-lookup.target
```

### Release Number

By default speculate will set the RPM release number to 1, if you want to override this you can do so by using the `--release` flag:

```sh
speculate --release=7
```

### Custom Name

By default speculate will set the name from `package.json`, if you want to override this you can do so by using the `--name` flag:

```sh
speculate --name=my-cool-api
```

This is useful if you are using private NPM packages which start with an `@`.

### Replace hyphens in npm version number

Running rpmbuild on an npm package with a hyphen in its version number throws an error. If your package's version number contains hyphens (e.g. it is a prerelease), you may wish to replace them so that the rpm can be built. You can tell speculate to replace these with tildes by adding the `replaceHyphens` property to your package's spec block:

```json
{
  "spec": {
    "replaceHyphens": true
  }
}
```

Or you can explicitly tell speculate to replace hyphens with tildes `"~"`, underscores `"_"` or plus signs `"+"`:

```json
{
  "spec": {
    "replaceHyphens": "_"
  }
}
```
