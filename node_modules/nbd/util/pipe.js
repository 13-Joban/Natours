define(function() {
  'use strict';
  return function chain() {
    var chainArgs = arguments;
    return function() {
      var i, retval;
      for (i=0; i<chainArgs.length; ++i) {
        retval=chainArgs[i].apply(this, i===0?arguments:[retval]);
      }
      return retval;
    };
  };
});
