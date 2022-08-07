/*global jasmine, describe, it, expect, spyOn */
define(['real/util/media'], function(media) {
  'use strict';

  describe('util/media', function() {

    it('is a function', function() {
      expect(media).toEqual(jasmine.any(Function));
    });

    it('depends on matchMedia', function() {
      var expectation = expect(function() {
        media('test', '(orientation: portrait)');
      });

      ((window.matchMedia || window.msMatchMedia) ?
        expectation.not :
        expectation).toThrow();
    });

    if (window.matchMedia || window.msMatchMedia) {

      it('fires a breakpoint from media queries', function() {
        var spy = jasmine.createSpy('onepixel');
        media.on('onepx', spy);

        media('onepx', '(min-width: 1px)');
        expect(spy).toHaveBeenCalled();
      });

      it('does not fire non-matching breakpoints', function() {
        var spy = jasmine.createSpy('zeropixel');
        media.on('zeropx', spy);

        media('zeropx', '(max-width: 0px)');
        expect(spy).not.toHaveBeenCalled();
      });

      describe('getState()', function() {

        it('reports breakpoint states', function() {
          expect( media.getState('onepx') ).toBe(true);
          expect( media.getState('zeropx') ).toBe(false);
        });

      });
    }

  });

  return media;

});
