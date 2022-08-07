/*global jasmine, describe, it, expect, spyOn, beforeEach */
define(['jquery', 'real/Controller/Entity', 'nbd/Controller', 'nbd/View/Entity', 'nbd/Model'], function($, Entity, Controller, View, Model) {
  'use strict';

  describe('Controller/Entity', function() {

    var instance;

    it('is a Controller constructor', function() {
      expect( Entity ).toEqual(jasmine.any(Function));
      expect( Entity.inherits(Controller) ).toBe(true);
    });

    beforeEach(function() {
      Entity.MODEL_CLASS = Model;
      Entity.VIEW_CLASS = View;

      instance = new Entity(0,{});
    });

    describe('Entity.prototype.init', function() {

      it('creates the Model', function() {
        expect( instance.Model ).toEqual(jasmine.any(Model));
      });

      it('creates the View', function() {
        expect( instance.View ).toBeDefined();
        expect( instance.View.Controller ).toBe( instance );
        expect( instance.View.id() ).toBe( instance.Model.id() );

      });

    });

    describe('Entity.prototype.render', function() {

      it('calls View render', function() {
        var $parent = $();

        spyOn( instance.View, 'render' );
        instance.render( $parent );
        expect( instance.View.render ).toHaveBeenCalledWith( $parent );
      });

      it('renders with the specified View class', function() {
        var $parent = $(),
        NewViewClass = Entity.VIEW_CLASS.extend({});

        instance.render( $parent, NewViewClass );
        expect( instance.View ).toEqual(jasmine.any(NewViewClass));
      });

    });

  });

  return Entity;
});
