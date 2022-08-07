/**
 * Prototype chain append utility
 * Inspired by Mozilla's Object.appendChain()
 * @see https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Object/GetPrototypeOf#Notes
 */
define(function() {
  'use strict';

  function swapProto(lProto, oProto) {
    var inst, p;

    if ((p=Object.getPrototypeOf(lProto)) !== Object.prototype) {
      swapProto(p, oProto); //?
      oProto = p.constructor.prototype;
    }

    inst = Object.create(oProto);
    for (p in lProto) {
      if (lProto.hasOwnProperty(p)) {
        inst[p] = lProto[p];
      }
    }
    inst.constructor = lProto.constructor;
    lProto.constructor.prototype = inst;

  }

  return function(Klass, Class, forced) {
    if (arguments.length < 2) {
      throw new TypeError("Not enough arguments");
    }
    if (typeof Klass !== "function") {
      throw new TypeError("First argument must be a constructor");
    }
    if (typeof Class !== "function") {
      throw new TypeError("Second argument must be a constructor");
    }

    var it = Klass.prototype, up;

    // Find the top non-native prototype
    while ((up=Object.getPrototypeOf(it)) !== Object.prototype) { it = up; }

    if (forced !== true) {
      // Try to modify the chain seamlessly if possible
      if (it.__proto__) {
        it.__proto__ = Class.prototype;
        return;
      }
      throw new Error("Cannot modify prototype chain");
    }

    swapProto(Klass.prototype, Class.prototype);
  }
});
