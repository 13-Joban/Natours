/*global jasmine, describe, it, expect, spyOn, beforeEach */
define(['real/Class'], function(Class) {
  'use strict';

  describe('Class', function() {

    it('is a constructor', function() {
      expect( Class ).toBeDefined();
      expect( Class ).toEqual(jasmine.any(Function));
    });

    describe('Class.extend', function() {

      it('is non-enumerable', function() {
        expect(Class.extend().propertyIsEnumerable('extend')).toBe(false);
      });

      it('creates subclasses', function() {
        var Subclass = Class.extend({});
        expect( Subclass.prototype.constructor ).toBe( Subclass );
        expect( new Subclass() ).toEqual( jasmine.any(Subclass) );
        expect( new Subclass() ).toEqual( jasmine.any(Class) );
      });

      it('inherits from prototype', function() {
        var rand = Math.random(), Subclass = Class.extend({xyz:rand});
        expect( (new Subclass()).xyz ).toEqual(rand);
      });

      it('inherits from static', function() {
        var rand = Math.random(), Subclass = Class.extend({},{xyz:rand});
        expect( Subclass.xyz ).toEqual(rand);
      });

      it('calls up the init chain by default', function() {
        var superproto = {init:function(){}},
        subproto = {init:function(){}},
        Superclass, Subclass;

        spyOn( superproto, 'init' );
        spyOn( subproto, 'init' );
        Superclass = Class.extend(superproto);
        Subclass = Superclass.extend(subproto);

        expect( new Subclass() ).toEqual(jasmine.any(Class));
        expect( superproto.init ).toHaveBeenCalled();
        expect( subproto.init ).toHaveBeenCalled();
      });

      it('is able to not call up the init chain', function() {
        var superproto = {init:function(){}},
        subproto = {init:function(){}},
        Superclass, Subclass;

        spyOn( superproto, 'init' );
        spyOn( subproto, 'init' );
        Superclass = Class.extend(superproto);
        Subclass = Superclass.extend(subproto, {_:true});

        expect( new Subclass() ).toEqual(jasmine.any(Class));
        expect( superproto.init ).not.toHaveBeenCalled();
        expect( subproto.init ).toHaveBeenCalled();
      });

      it('can call its super implementation', function(){
        var superproto = {impl:function(){}},
        subproto = {impl:function(){this._super('z');}, _super:function(){}},
        Superclass, Subclass, instance;

        spyOn( superproto, 'impl' );
        spyOn( subproto, '_super' );
        Superclass = Class.extend(superproto);
        Subclass = Superclass.extend(subproto);

        instance = new Subclass();
        instance.impl();

        expect(superproto.impl).toHaveBeenCalledWith('z');
        expect(subproto._super).not.toHaveBeenCalled();
      });

      it('throws when implementation throws', function() {
        var Super = Class.extend({test: function() {}}),
        Subclass = Super.extend({test: function() { this._super(); throw 'unfortunate'; }});

        var inst = new Subclass();
        expect(function() {
          inst.test();
        }).toThrow('unfortunate');
      });

      it('throws when superimplementation throws', function() {
        var Super = Class.extend({test: function() {throw 'unfortunate';}}),
        Subclass = Super.extend({test: function() { this._super(); }});

        var inst = new Subclass();
        expect(function() {
          inst.test();
        }).toThrow('unfortunate');
      });

    });

    describe('Class.mixin', function() {
      var Klass, kInstance;

      beforeEach(function() {
        Klass = Class.extend();
        kInstance = new Klass();
      });

      it('is non-enumerable', function() {
        expect(Klass.propertyIsEnumerable('mixin')).toBe(false);
      });


      it('adds object properties into a prototype', function() {
        Klass.mixin({ bigDeal: 'no' });
        expect( Klass.prototype.bigDeal ).toBe('no');
      });

      it('doesn\'t add prototype properties into a prototype', function() {
        var A = Class.extend({protoprop:true});
        Klass.mixin(new A());
        expect( Klass.prototype.protoprop ).not.toBeDefined();
      });

      it('provides to new instances', function() {
        Klass.mixin({ bigDeal: 'no' });
        expect( new Klass().bigDeal ).toBe('no');
      });

      it('provides to existing instances', function() {
        Klass.mixin({ bigDeal: 'no' });
        expect( kInstance.bigDeal ).toBe('no');
      });

      it('provides to subclasses', function() {
        var Qlass = Klass.extend();
        Klass.mixin({ bigDeal: 'no' });

        expect( new Qlass().bigDeal ).toBe('no');
      });

      it('overwrites conflicting mixins', function() {
        Klass.mixin({ bigDeal: 'no' });
        
        expect(function() {
          Klass.mixin({ bigDeal: 'yes' });
        }).toThrow();

        expect( Klass.prototype.bigDeal ).toBe('no');
        expect( kInstance.bigDeal ).toBe('no');
      });
    });

    describe('Class.inherits', function() {

      var Klass;

      beforeEach(function() {
        Klass= Class.extend();
      });

      it('is non-enumerable', function() {
        expect(Klass.propertyIsEnumerable('inherits')).toBe(false);
      });

      it('can check its ancestor class', function() {
        var A = Class.extend(), B = A.extend(), C = Klass;
        expect( A.inherits(Class) ).toBe(true);
        expect( B.inherits(Class) ).toBe(true);
        expect( C.inherits(Class) ).toBe(true);
        expect( B.inherits(A) ).toBe(true);
        expect( B.inherits(C) ).toBe(false);
      });

      it('can check whether an object was mixed in', function() {
        var trait = { bigDeal: 'no' };
        Klass.mixin( trait );
        expect( Klass.inherits(trait) ).toBe(true);
        expect( Klass.inherits({rTrait:null}) ).toBe(false);
      });

    });

  });

  return Class;

});
