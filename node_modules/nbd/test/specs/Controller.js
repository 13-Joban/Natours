/*global jasmine, describe, it, expect, spyOn, mostRecentAjaxRequest */
define(['real/Controller', 'jquery', 'nbd/Class', 'nbd/View', 'nbd/trait/jquery.tmpl'], function(Controller, $, Class, View, jqtmpl) {
  'use strict';

  describe('Controller', function() {

    it('is a class constructor', function() {
      expect( Controller ).toEqual(jasmine.any(Function));
      expect( Controller.inherits(Class) ).toBe(true);
    });

    xdescribe('Controller.addTemplate', function() {
      var tmpl = Controller.addTemplate( 'test-template', "Hello world" );

      it('adds the test-template', function() {
        expect( tmpl.html() ).toEqual('Hello world');
      });

      it('adds template with the given id', function() {
        expect( $('#test-template')[0] ).toBe( tmpl[0] );
      });

    });

    xdescribe('Controller.loadTemplate', function() {
      var tmpl = 'load-test-template',
      spies = { template:function(){} },
      now = Date.now(),
      templateResponse = {
        status : 200,
        responseText : JSON.stringify({ html : now })
      },
      promise;
      View = View.extend({},{ TEMPLATE_ID : tmpl }).mixin(jqtmpl);

      it('can load templates', function() {
        expect(function() {
          Controller.loadTemplate( View );
        }).toThrow("No template found");

        jasmine.Ajax.useMock();
        spyOn( spies, 'template' );
        View.TEMPLATE_URL = "xxx";

        promise = Controller.loadTemplate( View, spies.template )
        .done(function() {
          expect( spies.template ).toHaveBeenCalledWith(tmpl);
          expect( View.prototype.templateScript(false) ).not.toBe(false);
          expect( +View.prototype.templateScript(false).html() ).toEqual(now);
        });

        expect( promise.promise ).toBeDefined();

        mostRecentAjaxRequest().response( templateResponse );
      });
    });

  });

  return Controller;
});
