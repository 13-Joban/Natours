/*global jasmine, describe, it, expect, spyOn, beforeEach, afterEach */
define(['real/event'], function(event) {
  'use strict';

  describe('event', function() {

    it('is an object', function() {
      expect(event).toEqual(jasmine.any(Object));
      expect(event.on).toEqual(jasmine.any(Function));
      expect(event.off).toEqual(jasmine.any(Function));
      expect(event.trigger).toEqual(jasmine.any(Function));
    });
    
    it('has an alternate interface', function() {
      expect(event.bind).toEqual(jasmine.any(Function));
      expect(event.bind).toBe(event.on);
      expect(event.unbind).toEqual(jasmine.any(Function));
      expect(event.unbind).toBe(event.off);
      expect(event.fire).toEqual(jasmine.any(Function));
      expect(event.fire).toBe(event.trigger);
    });

    describe('event.trigger', function() {
      var first, middle, last;

      beforeEach(function() {
        first = jasmine.createSpy('first');
        middle = jasmine.createSpy('middle');
        last = jasmine.createSpy('last');
      });

      afterEach(function() {
        event.unbind('test');
      });

      it('should call bound functions', function() {
        var rand = Math.random(), now = Date.now();

        event.bind( 'test', first );
        event.bind( 'test', last );
        event.trigger( 'test', rand, now );

        expect( first ).toHaveBeenCalledWith(rand, now);
        expect( last ).toHaveBeenCalledWith(rand, now);
      });

      it('should only call functions bound to the event', function() {
        event.bind( 'test', middle );
        event.trigger( 'test_' );

        expect( middle ).not.toHaveBeenCalled();
      });

    });

    describe('event.unbind', function() {
      var first, last;

      beforeEach(function() {
        first = jasmine.createSpy('first');
        last = jasmine.createSpy('last');
      });

      it('should allow unbinding nonexistent events', function() {
        expect(function(){ event.unbind( 'lalilulelo' ); }).not.toThrow();
      });

      afterEach(function() {
        event.unbind('test');
      });

      it('should unbind a function', function() {
        event.bind( 'test', first );
        event.bind( 'test', last );
        event.unbind( 'test', first );
        event.trigger( 'test' );

        expect( first ).not.toHaveBeenCalled();
        expect( last ).toHaveBeenCalled();
      });

      it('should unbind all functions', function() {
        event.bind( 'test', first );
        event.bind( 'test', last );
        event.unbind( 'test' );
        event.trigger( 'test' );

        expect( first ).not.toHaveBeenCalled();
        expect( last ).not.toHaveBeenCalled();
      });

    });

  });

  return event;
});
