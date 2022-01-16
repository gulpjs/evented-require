'use strict';

var expect = require('expect');
var sinon = require('sinon');

var EventedRequire = require('../');

describe('evented-require', function() {

  it('must be constructed', function(done) {
    var ee = new EventedRequire();

    expect(typeof ee.require).toEqual('function');

    done();
  });

  it('can be constructed without new', function(done) {
    /* eslint new-cap: 0 */
    var ee = EventedRequire();

    expect(typeof ee.require).toEqual('function');

    done();
  });

  it('can require a module', function(done) {
    var ee = new EventedRequire();

    var result = ee.require(__dirname + '/fixtures/foo.js');

    expect(result).toEqual('foo');

    done();
  });

  it('resolves from a basedir it is constructed with', function(done) {
    var ee = new EventedRequire(__dirname);

    var result = ee.require('./fixtures/foo.js');

    expect(result).toEqual('foo');

    done();
  });

  it('emits a `before` event before the module is required', function(done) {
    var ee = new EventedRequire(__dirname);

    var spy = sinon.spy();

    ee.on('before', spy);

    ee.require('./fixtures/foo.js');

    expect(spy.callCount).toEqual(1);
    expect(spy.calledWithExactly('./fixtures/foo.js')).toBeTruthy();

    done();
  });

  it('emits a `success` event when the module is loaded successfully', function(done) {
    var ee = new EventedRequire(__dirname);

    var spy = sinon.spy();

    ee.on('success', spy);

    ee.require('./fixtures/foo.js');

    expect(spy.callCount).toEqual(1);
    expect(spy.calledWithExactly('./fixtures/foo.js', 'foo')).toBeTruthy();

    done();
  });

  it('emits a `failure` event when the module is NOT loaded successfully', function(done) {
    var ee = new EventedRequire(__dirname);

    var spy = sinon.spy();

    ee.on('failure', spy);

    ee.require('./fixtures/no-exist.js');

    expect(spy.callCount).toEqual(1);
    expect(spy.args[0][0]).toEqual('./fixtures/no-exist.js');
    expect(spy.args[0][1]).toBeInstanceOf(Error);

    done();
  });

  it('does not emit `failure` if `before` throws', function(done) {
    var ee = new EventedRequire(__dirname);

    var spy = sinon.spy();

    ee.on('before', function() {
      throw new Error('boom');
    });

    ee.on('failure', spy);

    expect(function() {
      ee.require('./fixtures/foo.js');
    }).toThrow('boom');

    expect(spy.callCount).toEqual(0);

    done();
  });

  it('does not emit `failure` if `success` throws', function(done) {
    var ee = new EventedRequire(__dirname);

    var spy = sinon.spy();

    ee.on('success', function() {
      throw new Error('boom');
    });

    ee.on('failure', spy);

    expect(function() {
      ee.require('./fixtures/foo.js');
    }).toThrow('boom');

    expect(spy.callCount).toEqual(0);

    done();
  });

  it('does not emit `failure` if `failure` throws', function(done) {
    var ee = new EventedRequire(__dirname);

    var spy = sinon.spy();

    ee.on('failure', function() {
      throw new Error('boom');
    });

    ee.on('failure', spy);

    expect(function() {
      ee.require('./fixtures/no-exist.js');
    }).toThrow('boom');

    expect(spy.callCount).toEqual(0);

    done();
  });

  it('allows require to be destructured', function(done) {
    var ee = new EventedRequire(__dirname);

    var spy = sinon.spy();

    var r = ee.require;

    ee.on('success', spy);

    r('./fixtures/foo.js');

    expect(spy.callCount).toEqual(1);
    expect(spy.calledWithExactly('./fixtures/foo.js', 'foo')).toBeTruthy();

    done();
  });

  it('allows requireAll to be destructured', function(done) {
    var ee = new EventedRequire(__dirname);

    var spy = sinon.spy();

    var ra = ee.requireAll;

    ee.on('success', spy);

    ra(['./fixtures/foo.js']);

    expect(spy.callCount).toEqual(1);
    expect(spy.calledWithExactly('./fixtures/foo.js', 'foo')).toBeTruthy();

    done();
  });

  it('loads node_modules', function(done) {
    var ee = new EventedRequire(__dirname);

    var result = ee.require('expect');

    expect(result).toEqual(expect);

    done();
  });

  it('exposes a requireAll method to load multiple modules in order', function(done) {
    var ee = new EventedRequire(__dirname);

    var spy = sinon.spy();

    ee.on('success', spy);

    ee.requireAll(['./fixtures/foo.js', './fixtures/bar.js']);

    expect(spy.callCount).toEqual(2);
    expect(spy.getCall(0).calledWithExactly('./fixtures/foo.js', 'foo')).toBeTruthy();
    expect(spy.getCall(1).calledWithExactly('./fixtures/bar.js', 'bar')).toBeTruthy();

    done();
  });

  it('only attempts to load a duplicate module once with requireAll', function(done) {
    var ee = new EventedRequire(__dirname);

    var spy = sinon.spy();

    ee.on('success', spy);

    ee.requireAll(['./fixtures/foo.js', './fixtures/bar.js', './fixtures/foo.js']);

    expect(spy.callCount).toEqual(2);
    expect(spy.getCall(0).calledWithExactly('./fixtures/foo.js', 'foo')).toBeTruthy();
    expect(spy.getCall(1).calledWithExactly('./fixtures/bar.js', 'bar')).toBeTruthy();

    done();
  });
});
