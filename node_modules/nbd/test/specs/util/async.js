/*global jasmine, describe, it, expect, runs, waitsFor */
define(['real/util/async'], function(async) {
  'use strict';

  describe('util/async', function() {
    it('runs the callback in a different callstack', function() {
      var flag, spy;

      spy = jasmine.createSpy('asyncspy').andCallFake(function() {
        flag = true;
      });

      runs(function() {
        flag = false;
        async(spy);
      });

      waitsFor(function() {
        return flag;
      }, "The function should have been run", 100);

      runs(function() {
        expect(spy).toHaveBeenCalled();
      });
    });
  });

  return async;
});
