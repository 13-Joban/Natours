/*global jasmine, describe, xdescribe, it, xit, expect, spyOn, beforeEach */
define(['real/trait/jquery.tmpl', 'jquery', 'nbd/View'], function(jqtmpl, $, nView) {
  'use strict';

  var View = nView.extend(),
  instance;
  View.mixin(jqtmpl);

  beforeEach(function() {
    instance = new View();
  });

  describe('trait/jquery.tmpl', function() {
    it('finds the class template from an instance', function() {
      var instance = new View();

      expect(function(){
        instance.templateScript();
      }).toThrow();
      expect( instance.templateScript(false) ).toBe(false);

      $('<script type="text/x-jquery-tmpl" id="mytest">Hello</script>').appendTo(document.body);
      View.TEMPLATE_ID = "mytest";
      expect( instance.templateScript(false) ).not.toBe(false);
      expect( instance.templateScript().html() ).toEqual('Hello');
    });
  });

  return jqtmpl;
});
