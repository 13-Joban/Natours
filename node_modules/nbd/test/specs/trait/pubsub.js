/*global jasmine, describe, it, expect, spyOn, loadFixtures */
define(['real/trait/pubsub', 'nbd/util/extend'], function(pubsub, extend) {
  'use strict';

  describe('trait/pubsub', function() {

    it("on and trigger", function() {
      var obj = { counter: 0 };
      extend(obj, pubsub);
      obj.on('event', function() { obj.counter += 1; });
      obj.trigger('event');
      expect(obj.counter).toEqual(1);
      obj.trigger('event');
      obj.trigger('event');
      obj.trigger('event');
      obj.trigger('event');
      expect(obj.counter).toEqual(5);
    });

    it("binding and triggering multiple events", function() {
      var obj = { counter: 0 };
      extend(obj, pubsub);

      obj.on('a b c', function() { obj.counter += 1; });

      obj.trigger('a');
      expect(obj.counter).toEqual(1);

      obj.trigger('a b');
      expect(obj.counter).toEqual(3);

      obj.trigger('c');
      expect(obj.counter).toEqual(4);

      obj.off('a c');
      obj.trigger('a b c');
      expect(obj.counter).toEqual(5);
    });

    it("trigger all for each event", function() {
      var a, b, obj = { counter: 0 };
      extend(obj,  pubsub);
      obj.on('all', function(event) {
        obj.counter++;
        if (event == 'a') { a = true; }
        if (event == 'b') { b = true; }
      })
      .trigger('a b');

      expect(a).toBe(true);
      expect(b).toBe(true);
      expect(obj.counter).toEqual(2);
    });

    it("on, then unbind all functions", function() {
      var obj = { counter: 0 }, callback;
      extend(obj, pubsub);
      callback = function() { obj.counter += 1; };
      obj.on('event', callback);
      obj.trigger('event');
      obj.off('event');
      obj.trigger('event');
      expect(obj.counter).toEqual(1);
    });

    it("bind two callbacks, unbind only one", function() {
      var obj = { counterA: 0, counterB: 0 },
      callback = function() { obj.counterA += 1; };
      extend(obj, pubsub);
      obj.on('event', callback);
      obj.on('event', function() { obj.counterB += 1; });
      obj.trigger('event');
      obj.off('event', callback);
      obj.trigger('event');
      expect(obj.counterA).toEqual(1);
      expect(obj.counterB).toEqual(2);
    });

    it("unbind a callback in the midst of it firing", function() {
      var obj = {counter: 0},
      callback = function() {
        obj.counter += 1;
        obj.off('event', callback);
      };
      extend(obj,  pubsub);
      obj.on('event', callback);
      obj.trigger('event');
      obj.trigger('event');
      obj.trigger('event');
      expect(obj.counter).toEqual(1);
    });

    it("two binds that unbind themeselves", function() {
      var obj = { counterA: 0, counterB: 0 },
      incrA = function(){ obj.counterA += 1; obj.off('event', incrA); },
      incrB = function(){ obj.counterB += 1; obj.off('event', incrB); };
      extend(obj, pubsub);
      obj.on('event', incrA);
      obj.on('event', incrB);
      obj.trigger('event');
      obj.trigger('event');
      obj.trigger('event');
      expect(obj.counterA).toEqual(1);
      expect(obj.counterB).toEqual(1);
    });

    it("bind a callback with a supplied context", function () {
      var obj, 
      TestClass = function () {},
      instance = new TestClass();

      obj = extend({}, pubsub);
      obj.on('event', function() {
        expect(this).toBe(instance);
      }, instance);
      obj.trigger('event');
    });

    it("nested trigger with unbind", function () {
      var obj = { counter: 0 },
      incr1 = function(){ obj.counter += 1; obj.off('event', incr1); obj.trigger('event'); },
      incr2 = function(){ obj.counter += 1; };
      extend(obj,  pubsub);
      obj.on('event', incr1);
      obj.on('event', incr2);
      obj.trigger('event');
      expect(obj.counter).toEqual(3);
    });

    it("callback list is not altered during trigger", function () {
      var counter = 0, obj = extend({},  pubsub),
      incr = function(){ counter++; };
      obj.on('event', function(){ obj.on('event', incr).on('all', incr); })
      .trigger('event');
      expect(counter, 0, 'bind does not alter callback list');
      obj.off()
      .on('event', function(){ obj.off('event', incr).off('all', incr); })
      .on('event', incr)
      .on('all', incr)
      .trigger('event');
      expect(counter).toEqual(2);
    });

    it("#1282 - 'all' callback list is retrieved after each event.", function() {
      var counter = 0,
      obj = extend({},  pubsub),
      incr = function(){ counter++; };
      obj.on('x', function() {
        obj.on('y', incr).on('all', incr);
      })
      .trigger('x y');
      expect(counter).toEqual(2);
    });

    it("if no callback is provided, `on` is a noop", function() {
      extend({},  pubsub).on('test').trigger('test');
    });

    it("remove all events for a specific context", function() {
      var obj = extend({},  pubsub),
      success = jasmine.createSpy('success');
      obj.on('x y all', success);
      obj.on('x y all', function() { throw new Error('Unreacheable'); }, obj);
      obj.off(null, null, obj);

      expect(function() {
        obj.trigger('x y');
      }).not.toThrow();

      expect(success).toHaveBeenCalled();
    });

    it("remove all events for a specific callback", function() {
      var obj = extend({},  pubsub),
      success = jasmine.createSpy('success'),
      fail = function() { throw new Error('failure case'); };
      obj.on('x y all', success);
      obj.on('x y all', fail);
      obj.off(null, fail);

      expect(function() {
        obj.trigger('x y');
      }).not.toThrow();

      expect(success).toHaveBeenCalled();
    });

    it("off is chainable", function() {
      var obj = extend({},  pubsub);
      // With no events
      expect(obj.off()).toBe(obj);
      // When removing all events
      obj.on('event', function(){}, obj);
      expect(obj.off()).toBe(obj);
      // When removing some events
      obj.on('event', function(){}, obj);
      expect(obj.off()).toBe(obj);
    });

    it("#1310 - off does not skip consecutive events", function() {
      var obj = extend({}, pubsub);
      obj.on('event', function() { throw new Error(); }, obj);
      obj.on('event', function() { throw new Error(); }, obj);
      obj.off(null, null, obj);

      expect(function() {
        obj.trigger('event');
      }).not.toThrow();
    });

    it("fires callbacks after an error is thrown", function() {
      var obj = extend({}, pubsub),
      spy = jasmine.createSpy('eventerror').andCallFake(function() { throw new Error(); });
      obj.on('event', spy);

      expect(function() { obj.trigger('event'); }).toThrow();
      expect(function() { obj.trigger('event'); }).toThrow();
      expect(spy).toHaveBeenCalled();
      expect(spy.callCount).toBe(2);
    });

    it("listenTo and stopListening", function() {
      var a = extend({}, pubsub),
      b = extend({}, pubsub),
      spyA = jasmine.createSpy('a');

      a.listenTo(b, 'all', spyA);
      b.trigger('anything');
      a.listenTo(b, 'all', spyA);
      a.stopListening();
      b.trigger('anything');

      expect(spyA).toHaveBeenCalled();
      expect(spyA.callCount).toBe(1);
    });
  });
  return pubsub;
});
