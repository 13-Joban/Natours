/*global jasmine, describe, it, expect, runs, waitsFor */
define(['real/util/pipe'], function(pipe) {
  'use strict';

  describe('util/pipe', function() {

    it('is a function', function() {
      expect(pipe()).toEqual(jasmine.any(Function));
    });

    it('calls function arguments', function() {
      var args = jasmine.createSpyObj('args', ['first','second','third']),
      piped = pipe(args.first, args.second, args.third);

      expect(args.first).not.toHaveBeenCalled();
      expect(args.second).not.toHaveBeenCalled();
      expect(args.third).not.toHaveBeenCalled();

      piped();
      
      expect(args.first).toHaveBeenCalled();
      expect(args.second).toHaveBeenCalled();
      expect(args.third).toHaveBeenCalled();
    });

    it('passes the return value along the pipe', function() {
      var args = jasmine.createSpyObj('args', ['first','second']),
      piped = pipe(args.first, args.second),
      rand1 = Math.random(),
      rand2 = Math.random();

      args.first.andCallFake(function() {
        return rand2;
      });

      piped(rand1);

      expect(args.first).toHaveBeenCalledWith(rand1);
      expect(args.second).toHaveBeenCalledWith(rand2);
    });
  });

  return pipe;

});
