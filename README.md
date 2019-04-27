<p align="center">
  <a href="http://gulpjs.com">
    <img height="257" width="114" src="https://raw.githubusercontent.com/gulpjs/artwork/master/gulp-2x.png">
  </a>
</p>

# evented-require

[![NPM version][npm-image]][npm-url] [![Downloads][downloads-image]][npm-url] [![Azure Pipelines Build Status][azure-pipelines-image]][azure-pipelines-url] [![Travis Build Status][travis-image]][travis-url] [![AppVeyor Build Status][appveyor-image]][appveyor-url] [![Coveralls Status][coveralls-image]][coveralls-url] [![Gitter chat][gitter-image]][gitter-url]

Require modules and receive events.

## Usage

```js
var EventedRequire = require('evented-require');

var basedir = process.cwd(); // or __dirname, etc

var loader = new EventedRequire(basedir);

var foo = loader.require('./foo'); // requires relative to basedir
var expect = loader.require('expect'); // requires from node_modules

loader.on('before', function(moduleName) {
  // emitted with the moduleName before that module is required
});

loader.on('success', function(moduleName, result) {
  // emitted with the moduleName and the result of the require when a module is successfully required
});

loader.on('failure', function(moduleName, error) {
  // emitted with the moduleName and the error of the require when a module fails to load
});

// loads a series of module in order, filtering out duplicate entries
loader.requireAll([
  './foo.js',
  './bar.js'
]);
```

## API

### `new EventedRequire(basedir)`

Constructs a new EventEmitter instance. Requires made using this instance will be relative to the `basedir` given.

#### `instance.require(moduleName)`

Instance method for requiring modules relative to the `basedir` of the instance. Emits events for `before`, `success`, and/or `failure` depending on the outcome of the require. Returns the result of the require if successful.

#### `instance.requireAll(moduleNames)`

Instance method for requiring an array of modules in order. Removes duplicates in the array before requiring them. Emits the same events as `instance.require` for each module.  Doesn't return anything.

#### event: `instance.on('before', function(moduleName) {})`

Emits the `before` event before a module is required. Provides the module name to the callback.

#### event: `instance.on('success', function(moduleName, module) {})`

Emits the `success` event after a module is required successfully. Provides the module name and the result of the require to the callback.

#### event: `instance.on('failure', function(moduleName, error) {})`

Emits the `failure` event after a module fails to load. Provides the module name and the error to the callback.

## License

MIT

[downloads-image]: http://img.shields.io/npm/dm/evented-require.svg
[npm-url]: https://www.npmjs.com/package/evented-require
[npm-image]: http://img.shields.io/npm/v/evented-require.svg

[azure-pipelines-url]: https://dev.azure.com/gulpjs/gulp/_build/latest?definitionId=3&branchName=master
[azure-pipelines-image]: https://dev.azure.com/gulpjs/gulp/_apis/build/status/evented-require?branchName=master

[travis-url]: https://travis-ci.org/gulpjs/evented-require
[travis-image]: http://img.shields.io/travis/gulpjs/evented-require.svg?label=travis-ci

[appveyor-url]: https://ci.appveyor.com/project/gulpjs/evented-require
[appveyor-image]: https://img.shields.io/appveyor/ci/gulpjs/evented-require.svg?label=appveyor

[coveralls-url]: https://coveralls.io/r/gulpjs/evented-require
[coveralls-image]: http://img.shields.io/coveralls/gulpjs/evented-require/master.svg

[gitter-url]: https://gitter.im/gulpjs/gulp
[gitter-image]: https://badges.gitter.im/gulpjs/gulp.svg
