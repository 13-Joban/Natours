/*global jasmine, describe, it, expect, spyOn, runs, waitsFor */
define(['real/Model', 'nbd/Class'], function(Model, Class) {
  'use strict';

  describe('Model', function() {

    it('is a Class constructor', function() {
      expect(Model).toEqual(jasmine.any(Function));
      expect(Model.inherits( Class )).toBe(true);
    });

    describe('Model.prototype.init', function() {

      it('initializes with data', function() {
        var rand = Math.random(), 
        instance = new Model( 1, {xyz:rand}),
        data;

        expect( instance.id() ).toBe(1);
        expect( data = instance.data() ).toEqual(jasmine.any(Object));
        expect( data.xyz ).toBe(rand);
      });

      it('supports non-numeric keys', function() {
        var instance = new Model( "xyz", {});
        expect( instance.id() ).toBe('xyz');

        instance = new Model( -1, {});
        expect( instance.id() ).toBe(-1);
      });

    });

    describe('Model.prototype.get', function() {

      it('returns a value', function() {
        var rand = Math.random(), instance = new Model( 1, {xyz:rand});
        expect( instance.get('xyz') ).toBe(rand);
      });

      it('returns unepxected property names as undefined', function() {
        var instance = new Model( 1, {xyz:'xyz'});
        expect(instance.get('abc')).not.toBeDefined();
      });

      it('returns undefined values', function() {
        var instance = new Model( 1, {xyz:undefined});
        expect( instance.get('xyz') ).not.toBeDefined();
      });

    });

    describe('Model.prototype.set', function() {
      var rand = Math.random(), instance = new Model( 1, {xyz:null, foo:'bar'});

      it('accepts an object map', function() {
        expect(function(){ instance.set({xyz:0}); }).not.toThrow();
        expect( instance.get('xyz') ).toBe(0);
      });

      it('accepts a key/value pair', function() {
        expect(function(){ instance.set('xyz', rand); }).not.toThrow();
        expect( instance.get('xyz') ).toBe(rand);
      });

      it('announces changes to the data object', function() {
        var result, cb;

        cb = jasmine.createSpy('fooSpy').andCallFake(function(val) {
          result = val;
        });

        runs(function() {
          instance.on('foo', cb);

          expect(instance.get('foo')).toBe('bar');
          instance.set('foo', 'baz');
        });

        waitsFor(function() {
          return !!result;
        }, "Callback was not called", 10);

        runs(function() {
          expect(cb).toHaveBeenCalledWith('baz', 'bar');
          expect(result).toBe('baz');
          expect(instance.get('foo')).toBe('baz');
        });

      });
    });

    describe('Model.prototype.data', function() {
      var data = { foo: 'bar' },
      instance = new Model(0, data);

      it('returns the data object', function() {
        expect(instance.data()).toBe(data);
      });

      it('announces changes to the data object', function() {
        var result, cb;

        cb = jasmine.createSpy('fooSpy').andCallFake(function(val) {
          result = val;
        });

        runs(function() {
          var d = instance.data();
          instance.on('foo', cb);

          expect(d.foo).toBe('bar');
          d.foo = 'baz';
        });

        waitsFor(function() {
          return !!result;
        }, "Callback was not called", 10);

        runs(function() {
          expect(cb).toHaveBeenCalledWith('baz', 'bar');
          expect(result).toBe('baz');
          expect(instance.get('foo')).toBe('baz');
        });

      });
    });

  });

  return Model;

});
