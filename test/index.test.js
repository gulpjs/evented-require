'use strict';

var expect = require('expect');
var path = require('path');
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

    var result = ee.require('./fixtures/bar.js');

    expect(result).toEqual('bar');

    done();
  });

  it('require a module even if it was already required', function(done) {
    var ee = new EventedRequire(__dirname);

    var result = ee.require('./fixtures/bar.js');

    expect(result).toEqual('bar');

    done();
  });

  it('emits a `before` event before the module is required', function(done) {
    var ee = new EventedRequire(__dirname);

    var spy = expect.createSpy();

    ee.on('before', spy);

    var result = ee.require('./fixtures/baz.js');

    expect(result).toEqual('baz');

    expect(spy.calls.length).toEqual(1);
    expect(spy.calls[0].arguments).toEqual(['./fixtures/baz.js']);

    done();
  });

  it('emits a `before` event even if the module was already required', function(done) {
    var ee = new EventedRequire(__dirname);

    var spy = expect.createSpy();

    ee.on('before', spy);

    var result = ee.require('./fixtures/baz.js');

    expect(result).toEqual('baz');

    expect(spy.calls.length).toEqual(1);
    expect(spy.calls[0].arguments).toEqual(['./fixtures/baz.js']);

    done();
  });

  it('emits a `success` event when the module is loaded successfully', function(done) {
    var ee = new EventedRequire(__dirname);

    var spy = expect.createSpy();

    ee.on('success', spy);

    var result = ee.require('./fixtures/qux.js');

    expect(result).toEqual('qux');

    expect(spy.calls.length).toEqual(1);
    expect(spy.calls[0].arguments).toEqual(['./fixtures/qux.js', 'qux']);

    done();
  });

  it('emits a `failure` event when the module is NOT loaded successfully', function(done) {
    var ee = new EventedRequire(__dirname);

    var spy = expect.createSpy();

    ee.on('failure', spy);

    var result = ee.require('./fixtures/no-exist.js');

    expect(result).toEqual(null);

    expect(spy.calls.length).toEqual(1);
    expect(spy.calls[0].arguments[0]).toEqual('./fixtures/no-exist.js');
    expect(spy.calls[0].arguments[1]).toBeAn(Error);

    done();
  });

  it('emits a `exists` event when the module was already required', function(done) {
    var ee = new EventedRequire(__dirname);

    var spy = expect.createSpy();

    ee.on('exists', spy);

    var result = ee.require('./fixtures/foo.js');

    expect(result).toEqual('foo');

    expect(spy.calls.length).toEqual(1);
    expect(spy.calls[0].arguments[0]).toEqual('./fixtures/foo.js');
    expect(spy.calls[0].arguments[1]).toEqual(path.resolve(__dirname, './fixtures/foo.js'));

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
      ee.require('./fixtures/quux.js');
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

    r('./fixtures/corge.js');

    expect(spy.calls.length).toEqual(1);
    expect(spy.calls[0].arguments).toEqual(['./fixtures/corge.js', 'corge']);

    done();
  });

  it('allows requireAll to be destructured', function(done) {
    var ee = new EventedRequire(__dirname);

    var spy = expect.createSpy();

    var ra = ee.requireAll;

    ee.on('success', spy);

    ra(['./fixtures/grault.js']);

    expect(spy.calls.length).toEqual(1);
    expect(spy.calls[0].arguments).toEqual(['./fixtures/grault.js', 'grault']);

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

    var results = ee.requireAll([
      './fixtures/garply.js',
      './fixtures/waldo.js',
    ]);

    expect(results['./fixtures/garply.js'], 'garply');
    expect(results['./fixtures/waldo.js'], 'waldo');

    expect(spy.calls.length).toEqual(2);
    expect(spy.calls[0].arguments).toEqual(['./fixtures/garply.js', 'garply']);
    expect(spy.calls[1].arguments).toEqual(['./fixtures/waldo.js', 'waldo']);

    done();
  });

  it('only attempts to load a duplicate module once with requireAll', function(done) {
    var ee = new EventedRequire(__dirname);

    var spySuccess = expect.createSpy();
    var spyAlready = expect.createSpy();

    ee.on('success', spySuccess);
    ee.on('exists', spyAlready);

    var moduleNames = [
      './fixtures/fred.js',
      './fixtures/bar.js',
      './fixtures/fred.js',
      'eslint',
      '../node_modules/eslint/lib/api.js',
      '../node_modules/expect/lib',
      'expect',
    ];
    var modules = ee.requireAll(moduleNames);

    expect(modules[moduleNames[0]]).toEqual('fred');
    expect(modules[moduleNames[1]]).toEqual('bar');
    expect(modules[moduleNames[2]]).toEqual('fred');
    expect(modules[moduleNames[3]]).toNotEqual(null);
    expect(modules[moduleNames[3]]).toEqual(modules[moduleNames[4]]);
    expect(modules[moduleNames[5]]).toNotEqual(null);
    expect(modules[moduleNames[5]]).toEqual(modules[moduleNames[6]]);

    expect(spySuccess.calls.length).toEqual(2);
    expect(spySuccess.calls[0].arguments).toEqual([moduleNames[0], modules[moduleNames[0]]]);
    expect(spySuccess.calls[1].arguments).toEqual([moduleNames[3], modules[moduleNames[3]]]);

    expect(spyAlready.calls.length).toEqual(5);
    expect(spyAlready.calls[0].arguments).toEqual([moduleNames[1], path.resolve(__dirname, moduleNames[1])]);
    expect(spyAlready.calls[1].arguments).toEqual([moduleNames[2], path.resolve(__dirname, moduleNames[0])]);
    expect(spyAlready.calls[2].arguments).toEqual([moduleNames[4], path.resolve(__dirname, moduleNames[4])]);
    expect(spyAlready.calls[3].arguments).toEqual([moduleNames[5], path.resolve(__dirname, moduleNames[5], 'index.js')]);
    expect(spyAlready.calls[4].arguments).toEqual([moduleNames[6], path.resolve(__dirname, moduleNames[5], 'index.js')]);

    done();
  });
});
