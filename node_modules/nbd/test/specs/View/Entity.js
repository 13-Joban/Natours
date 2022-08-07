/*global jasmine, describe, it, expect, spyOn, beforeEach */
define(['real/View/Entity', 'jquery', 'nbd/View', 'nbd/Model'], function(Entity, $, View, Model) {
  'use strict';

  describe('View/Entity', function() {
    var instance;

    it('is a View constructor', function() {
      expect( Entity ).toEqual(jasmine.any(Function));
      expect( Entity.inherits(View) ).toBe(true);
    });

    describe('View.Entity.prototype.init', function() {

      it('accepts a Model', function() {
        var id = Date.now(),
        model = new Model( id, {} ),
        instance = new Entity(model);

        expect( instance.id ).toBeDefined();
        expect( instance.id() ).toBe(id);
        expect( instance.Model ).toBe( model );
      });

      it('accepts non-Models', function() {
        var id = Date.now(),
        instance = new Entity(id);

        expect( instance.id ).toBeDefined();
        expect( instance.id() ).toBe(id);
        expect( instance.Model ).not.toBeDefined();
      });

    });

    describe('View.Entity.prototype.templateData', function() {

      it('returns an object with the Model', function() {
        var model = new Model( 0, {} ),
        instance = new Entity(model);

        expect( instance.templateData ).toBeDefined();
        expect( instance.templateData() ).toEqual(jasmine.any(Object));
        expect( instance.templateData() ).toBe( model.data() );
      });

    });

    describe('View.Entity.prototype.render', function() {

      var id, item, $test, model, instance;

      beforeEach(function() {
        id = Date.now();
        item = 'lorem ipsum';
        $test = $('<div id="entity-test"/>');
        model = new Model( id, {item:item} );
        instance = new Entity(model);
        instance.template = function(data) {
          return $('<span>', {text:this.id()+" : "+data.item});
        };
      });

      it('renders a template into the parent element', function() {
        instance.rendered = $.noop;
        spyOn( instance, 'rendered' );
        spyOn( instance, 'templateData' ).andCallThrough();

        instance.render($test);

        expect( $test.text() ).toEqual(id+' : '+item);
        expect( instance.rendered ).toHaveBeenCalled();
        expect( instance.templateData ).toHaveBeenCalled();
      });

      it('re-renders without a parent element', function() {
        instance.rendered = $.noop;
        spyOn( instance, 'rendered' );
        spyOn( instance, 'templateData' ).andCallThrough();

        instance.render($test);

        expect(instance.$view).toBeDefined();
        var shun = jasmine.createSpy();
        instance.$view.on('click', shun);

        model.set('item', item);
        instance.render();

        expect( $test.text() ).toEqual(id+' : '+item);
        expect( instance.rendered ).toHaveBeenCalled();
        expect( instance.templateData ).toHaveBeenCalled();

        instance.$view.trigger('click');
        expect( shun ).not.toHaveBeenCalled();
      });

      it('renders when there\'s no parent and has not already been rendered', function() {
        instance.rendered = $.noop;
        spyOn( instance, 'rendered' );
        spyOn( instance, 'templateData' ).andCallThrough();

        var $view = instance.render();

        expect( $test ).toBeEmpty();
        expect( $view ).not.toBeNull();
        expect( instance.rendered ).toHaveBeenCalled();
        expect( instance.templateData ).toHaveBeenCalled();
      });

      it('does not re-render, only reattach, when it has been rendered and there is a parent', function() {
        instance.rendered = $.noop;
        spyOn( instance, 'templateData' ).andCallThrough();
        instance.render($test);

        var shun = jasmine.createSpy('binding');
        instance.$view.on('click', shun);

        spyOn( instance, 'rendered' );
        model.set('item', null);
        instance.render($test);

        expect( $test.text() ).toEqual(id+' : '+item);
        expect( instance.rendered ).not.toHaveBeenCalled();
        expect( instance.templateData.callCount ).toBe(1);

        instance.$view.trigger('click');
        expect( shun ).toHaveBeenCalled();
        expect( shun.callCount ).toBe(1);
      });

    });
  });

  return Entity;
});
