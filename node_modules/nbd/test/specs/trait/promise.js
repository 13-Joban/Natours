/*global jasmine, describe, it, expect, spyOn */
define(['real/trait/promise', 'nbd/Class', 'jquery'], function(promise, Class, $) {
  'use strict';
  // Only ever test nbd related functionality here
  // Actual Promise/A+ testing done in test/lib/promise-adapter

  describe('trait/promise', function() {
    var Klass, inst;

    beforeEach(function() {
      Klass = Class.extend();
      inst = new Klass();
    });

    it('can be mixin()ed', function() {
      expect(function() {
        Klass.mixin(promise);
      }).not.toThrow();
    });

    beforeEach(function() {
      Klass.mixin(promise);
    });

    describe('.then()', function() {

      it('can be mixin()ed', function() {
        expect(inst.then).toEqual(jasmine.any(Function));
      });

      it('returns a promise', function() {
        var promise = inst.then();

        expect(promise.then).toEqual(jasmine.any(Function));
      });

    });

    describe('.resolve()', function() {

      it('resolves the promise', function() {
        var sentinel = jasmine.createSpy('then callback');

        inst.then(sentinel);
        inst.resolve('original');

        waits(15);

        runs(function() {
          expect(sentinel).toHaveBeenCalledWith('original');
        });
      });

      it('callsback when the promise has already resolved', function() {
        var sentinel = jasmine.createSpy('then callback');

        inst.resolve('original');
        inst.then(sentinel);

        waits(15);

        runs(function() {
          expect(sentinel).toHaveBeenCalledWith('original');
        });
      });

    });

    describe('.reject()', function() {

      it('rejects the promise', function() {
        var fake = jasmine.createSpy(),
        sentinel = jasmine.createSpy('then callback');

        inst.then(fake, sentinel);
        inst.reject('original');

        waits(15);

        runs(function() {
          expect(fake).not.toHaveBeenCalled();
          expect(sentinel).toHaveBeenCalledWith('original');
        });
      });

      it('callsback when the promise has already rejected', function() {
        var fake = jasmine.createSpy(),
        sentinel = jasmine.createSpy('then callback');

        inst.reject('original');
        inst.then(fake, sentinel);

        waits(15);

        runs(function() {
          expect(fake).not.toHaveBeenCalled();
          expect(sentinel).toHaveBeenCalledWith('original');
        });
      });

    });

    describe('.thenable()', function() {
      var promise;

      beforeEach(function() {
        promise = inst.thenable();
      });

      it('returns a promise', function() {
        expect(promise.then).toEqual(jasmine.any(Function));
      });

      it('can not be controlled by itself', function() {
        expect(promise.resolve).not.toBeDefined();
        expect(promise.reject).not.toBeDefined();
      });

      it('can be controlled by original promise', function() {
        var sentinel = jasmine.createSpy('then callback');

        promise.then(sentinel);
        inst.resolve('original');

        waits(15);

        runs(function() {
          expect(sentinel).toHaveBeenCalledWith('original');
        });
      });

    });

    describe('.promise()', function() {
      var promise;

      beforeEach(function() {
        promise = inst.promise();
      });

      it('returns a jQuery Deferrable-compatible object', function() {
        expect( promise.done ).toEqual(jasmine.any(Function));
        expect( promise.fail ).toEqual(jasmine.any(Function));
        expect( promise.progress ).toEqual(jasmine.any(Function));
        expect( promise.promise ).toEqual(jasmine.any(Function));
      });

      it('infinitely returns its own .promise()', function() {
        expect( promise.promise() ).toBe(promise);
      });

      it('mixes in with jQuery Deferrables', function() {
        var onDone = jasmine.createSpy('jQuery onDone');

        $.when( promise, undefined ).done(onDone);

        runs(function() { 
          inst.resolve('promise land');
        });
        waits(15);
        runs(function() {
          expect(onDone).toHaveBeenCalledWith('promise land', undefined);
        });
      });
    });

  });

  return promise;
});
