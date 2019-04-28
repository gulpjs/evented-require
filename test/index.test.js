'use strict';

var expect = require('expect');

var EventedRequire = require('../');

describe('evented-require', function() {

  it('must be constructed', function(done) {
    var ee = new EventedRequire();

    expect(ee.require).toBeA('function');

    done();
  });

  it('can be constructed without new', function(done) {
    /* eslint new-cap: 0 */
    var ee = EventedRequire();

    expect(ee.require).toBeA('function');

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

    var spy = expect.createSpy();

    ee.on('before', spy);

    ee.require('./fixtures/foo.js');

    expect(spy.calls.length).toEqual(1);
    expect(spy.calls[0].arguments).toEqual(['./fixtures/foo.js']);

    done();
  });

  it('emits a `success` event when the module is loaded successfully', function(done) {
    var ee = new EventedRequire(__dirname);

    var spy = expect.createSpy();

    ee.on('success', spy);

    ee.require('./fixtures/foo.js');

    expect(spy.calls.length).toEqual(1);
    expect(spy.calls[0].arguments).toEqual(['./fixtures/foo.js', 'foo']);

    done();
  });

  it('emits a `failure` event when the module is NOT loaded successfully', function(done) {
    var ee = new EventedRequire(__dirname);

    var spy = expect.createSpy();

    ee.on('failure', spy);

    ee.require('./fixtures/no-exist.js');

    expect(spy.calls.length).toEqual(1);
    expect(spy.calls[0].arguments[0]).toEqual('./fixtures/no-exist.js');
    expect(spy.calls[0].arguments[1]).toBeAn(Error);

    done();
  });

  it('does not emit `failure` if `before` throws', function(done) {
    var ee = new EventedRequire(__dirname);

    var spy = expect.createSpy();

    ee.on('before', function() {
      throw new Error('boom');
    });

    ee.on('failure', spy);

    expect(function() {
      ee.require('./fixtures/foo.js');
    }).toThrow('boom');

    expect(spy.calls.length).toEqual(0);

    done();
  });

  it('does not emit `failure` if `success` throws', function(done) {
    var ee = new EventedRequire(__dirname);

    var spy = expect.createSpy();

    ee.on('success', function() {
      throw new Error('boom');
    });

    ee.on('failure', spy);

    expect(function() {
      ee.require('./fixtures/foo.js');
    }).toThrow('boom');

    expect(spy.calls.length).toEqual(0);

    done();
  });

  it('does not emit `failure` if `failure` throws', function(done) {
    var ee = new EventedRequire(__dirname);

    var spy = expect.createSpy();

    ee.on('failure', function() {
      throw new Error('boom');
    });

    ee.on('failure', spy);

    expect(function() {
      ee.require('./fixtures/no-exist.js');
    }).toThrow('boom');

    expect(spy.calls.length).toEqual(0);

    done();
  });

  it('allows require to be destructured', function(done) {
    var ee = new EventedRequire(__dirname);

    var spy = expect.createSpy();

    var r = ee.require;

    ee.on('success', spy);

    r('./fixtures/foo.js');

    expect(spy.calls.length).toEqual(1);
    expect(spy.calls[0].arguments).toEqual(['./fixtures/foo.js', 'foo']);

    done();
  });

  it('allows requireAll to be destructured', function(done) {
    var ee = new EventedRequire(__dirname);

    var spy = expect.createSpy();

    var ra = ee.requireAll;

    ee.on('success', spy);

    ra(['./fixtures/foo.js']);

    expect(spy.calls.length).toEqual(1);
    expect(spy.calls[0].arguments).toEqual(['./fixtures/foo.js', 'foo']);

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

    var spy = expect.createSpy();

    ee.on('success', spy);

    ee.requireAll(['./fixtures/foo.js', './fixtures/bar.js']);

    expect(spy.calls.length).toEqual(2);
    expect(spy.calls[0].arguments).toEqual(['./fixtures/foo.js', 'foo']);
    expect(spy.calls[1].arguments).toEqual(['./fixtures/bar.js', 'bar']);

    done();
  });

  it('only attempts to load a duplicate module once with requireAll', function(done) {
    var ee = new EventedRequire(__dirname);

    var spy = expect.createSpy();

    ee.on('success', spy);

    ee.requireAll(['./fixtures/foo.js', './fixtures/bar.js', './fixtures/foo.js']);

    expect(spy.calls.length).toEqual(2);
    expect(spy.calls[0].arguments).toEqual(['./fixtures/foo.js', 'foo']);
    expect(spy.calls[1].arguments).toEqual(['./fixtures/bar.js', 'bar']);

    done();
  });
});
