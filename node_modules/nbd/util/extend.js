define(function() {
  'use strict';

  return function(obj) {
    var i, prop, source;
    for (i=1; i<arguments.length; ++i) {
      source = arguments[i];
      for (prop in source) {
        obj[prop] = source[prop];
      }
    }
    return obj;
  };
});
