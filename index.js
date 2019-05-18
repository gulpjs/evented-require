'use strict';

var inherits = require('util').inherits;
var EventEmitter = require('events').EventEmitter;
var resolve = require('resolve');

function EventedRequire(basedir) {
  if (!(this instanceof EventedRequire)) {
    return new EventedRequire(basedir);
  }

  EventEmitter.call(this);

  this._basedir = basedir;

  // This allows the methods to be destructured from the instance and still work
  this.require = this.require.bind(this);
  this.requireAll = this.requireAll.bind(this);
}

inherits(EventedRequire, EventEmitter);

EventedRequire.prototype.require = function(moduleName) {
  var opts = {};
  if (this._basedir) {
    opts.basedir = this._basedir;
  }

  var result, already, modulePath;
  this.emit('before', moduleName);
  try {
    modulePath = resolve.sync(moduleName, opts);
    if (require.cache[modulePath]) {
      already = true;
    }
    result = require(modulePath);
  } catch (e) {
    this.emit('failure', moduleName, e);
    return null;
  }

  if (already) {
    this.emit('already', moduleName, modulePath);
  } else {
    this.emit('success', moduleName, result);
  }
  return result;
};

EventedRequire.prototype.requireAll = function(moduleNames) {
  var result = {};
  for (var i = 0, n = moduleNames.length; i < n; i++) {
    result[moduleNames[i]] = this.require(moduleNames[i]);
  }
  return result;
};

module.exports = EventedRequire;
