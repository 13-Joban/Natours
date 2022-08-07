/*global jasmine, describe, it, expect, spyOn, loadFixtures */
define(['real/util/extend'], function(extend) {
  'use strict';

  describe('util/extend', function() {
    var a = {one:true}, 
    b = {two:true}, 
    c = {one:false, three:true};

    it('adds properties from subsequent arguments to first argument', function() {
      var result = extend(a, b);
      expect(result.one).toBe(true);
      expect(result.two).toBe(true);
      expect(result.three).not.toBeDefined();

      result = extend(a, b, c);
      expect(result.one).toBe(false);
      expect(result.two).toBe(true);
      expect(result.three).toBe(true);
    });

    it('returns the extended object', function() {
      var result = extend(a, b);
      expect(result).toBe(a);
    });
  });

  return extend;
});
