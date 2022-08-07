/*global jasmine, describe, it, expect, runs, waitsFor */
define(['real/util/deparam'], function(deparam) {
  'use strict';

  describe('util/deparam', function() {

    var params_obj = { a:['4','5','6'], b:{x:['7'], y:'8', z:['9','0','true','false','undefined','']}, c:'1' },
    params_obj_coerce = { a:[4,5,6], b:{x:[7], y:8, z:[9,0,true,false,undefined,'']}, c:1 },
    params_str = 'a[]=4&a[]=5&a[]=6&b[x][]=7&b[y]=8&b[z][]=9&b[z][]=0&b[z][]=true&b[z][]=false&b[z][]=undefined&b[z][]=&c=1';

    it('is a function', function() {
      expect(deparam).toEqual(jasmine.any(Function));
    });

    it('converts a param string into an object', function() {
      expect( deparam( params_str ) ).toEqual( params_obj );
    });

    it('type coerces a param string into an object', function() {
      expect( deparam( params_str, true ) ).toEqual( params_obj_coerce );
    });

  });

  return deparam;

});
