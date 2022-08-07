define(['./Class',
       './util/async',
       './util/extend',
       './util/diff',
       './trait/pubsub'
], function(Class, async, extend, diff, pubsub) {
  "use strict";

  var dirtyCheck = function(old, novel) {
    if (!this._dirty) { return; }
    diff.call(this, novel || this._data, old, this.trigger);
    this._dirty = 0;
  },

  constructor = Class.extend({

    init: function(id, data) {

      if ( typeof id === 'string' && id.match(/^\d+$/) ) {
        id = +id;
      }

      if ( data === undefined && typeof id === "object" ) {
        data = id;
      }

      this.id = function() {
        return id;
      };

      try {
        Object.defineProperty(this, '_dirty', { value: 0, writable: true });
        Object.defineProperty(this, '_data', {
          enumerable: false,
          configurable: true,
          value: data || {},
          writable: true
        });
      }
      catch (noDefineProperty) {
        // Can't use ES5 Object.defineProperty, fallback
        this._dirty = 0;
        this._data = data;
      }

    },

    destroy: function() {
      this.off();
    },

    data : function() {
      if (!(this._dirty++)) {
        async(dirtyCheck.bind(this, extend({}, this._data)));
      }
      return this._data;
    },

    get: function(prop) {
      return this._data[prop];
    },

    set: function(values, value) {
      var key, data = this.data();

      if ( typeof values === "string" ) {
        data[values] = value;
        return this;
      }

      if ( typeof values === "object" ) {
        for ( key in values ) {
          if ( values.hasOwnProperty( key ) ) {
            data[key] = values[key];
          }
        }
        return this;
      }
    },

    toJSON: function() {
      return this._data;
    }
  })
  .mixin(pubsub);

  return constructor;

});
