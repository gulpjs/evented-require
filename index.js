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

  this.require = this.require.bind(this);
  this.requireAll = this.requireAll.bind(this);
}

inherits(EventedRequire, EventEmitter);

EventedRequire.prototype.require = function(moduleName) {
  var opts = {};
  if (this._basedir) {
    opts.basedir = this._basedir;
  }

  var result;
  this.emit('before', moduleName);
  try {
    result = require(resolve.sync(moduleName, opts));
  } catch (e) {
    this.emit('failure', moduleName, e);
    return;
  }
  this.emit('success', moduleName, result);
  return result;
};

EventedRequire.prototype.requireAll = function(moduleNames) {
  moduleNames.filter(toUnique).forEach(this.require);
};

function toUnique(elem, index, array) {
  return array.indexOf(elem) === index;
}

module.exports = EventedRequire;
