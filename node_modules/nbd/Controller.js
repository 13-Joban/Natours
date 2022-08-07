define(['./Class',
       './View',
       './util/construct'
],  function(Class, View, construct) {
  "use strict";

  var constructor = Class.extend({
    View  : null,
    destroy : function() {},

    _initView : function( ViewClass ) {
      var args = Array.prototype.slice.call(arguments, 1);
      (this._view = this.View = construct.apply(ViewClass, args))
      .Controller = this;
    },

    switchView : function() {
      var existing = this._view;
      this._initView.apply(this, arguments);

      if ( !existing ) { return; }

      if (existing.$view) {
        this._view.$view = existing.$view;
        this._view.render();
      }

      existing.destroy();
    }

  });

  return constructor;

});
