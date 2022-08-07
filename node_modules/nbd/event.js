define(['./util/extend', './trait/pubsub'], function(extend, pubsub) {
  'use strict';

  var exports = extend({}, pubsub);

  // Aliases
  exports.bind = exports.on;
  exports.unbind = exports.off;
  exports.fire = exports.trigger;

  return exports;
});
