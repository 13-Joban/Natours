/*global jasmine, describe, xdescribe, it, expect, spyOn, beforeEach */
define(['real/View', 'nbd/Class', 'jquery'], function(View, Class, $) {
  'use strict';

  describe('View', function() {

    var instance;

    beforeEach(function() {
      instance = new View();
    });

    it('is a Class constructor', function() {
      expect( View ).toEqual(jasmine.any(Function));
      expect( View.inherits( Class ) ).toBe(true);
    });

    describe('View.prototype.templateData', function() {
      it('returns an object', function() {
        expect( instance.templateData() ).toEqual(jasmine.any(Object)); 
      });
    });

    describe('View.prototype.render', function() {
      it('uses templateData when given no data', function() {
        spyOn( instance, 'templateData' );

        instance.render();

        expect( instance.templateData ).toHaveBeenCalled();
      });

      it('uses data when given', function() {
        var data = { rand: Math.random() };

        spyOn( instance, 'template' ).andCallThrough();
        spyOn( instance, 'templateData' );

        instance.render(data);

        expect( instance.templateData ).not.toHaveBeenCalled();
        expect( instance.template ).toHaveBeenCalledWith(data);
      });

      it('calls rendered() if any', function() {
        instance.rendered = function() {
          expect(this).toBe(instance);
        };
        spyOn( instance, 'rendered' ).andCallThrough();
        instance.render();
        expect( instance.rendered ).toHaveBeenCalled();
      });

      it('fires prerender event', function() {
        var prerender = jasmine.createSpy('prerender')
        .andCallFake(function() {
          expect( instance.template ).not.toHaveBeenCalled();
        });
        spyOn( instance, 'template' ).andCallThrough();

        instance.on('prerender', prerender);
        instance.render();

        expect( prerender ).toHaveBeenCalled();
      });

      it('fires postrender event', function() {
        var postrender = jasmine.createSpy('postrender')
        .andCallFake(function() {
          expect( instance.template ).toHaveBeenCalled();
        });
        spyOn( instance, 'template' ).andCallThrough();

        instance.on('postrender', postrender);
        instance.render();

        expect( postrender ).toHaveBeenCalledWith( instance.$view );
      });
    });


    describe('View.prototype.destroy', function() {
      it('destroys itself', function() {
        var instance = new View();

        instance.template = function() {
          return $('<div id="mytest" />').appendTo(document.body);
        };

        instance.render();
        instance.destroy();
        expect( $('#mytest').length ).toBe(0);
        expect( instance.$view ).toBe(null);
      });
    });
  });

  return View;
});
