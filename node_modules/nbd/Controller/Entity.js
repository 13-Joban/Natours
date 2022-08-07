define(['../util/construct',
       '../Controller',
       '../View/Entity',
       '../Model'
], function(construct, Controller, View, Model) {
  'use strict';

  var constructor = Controller.extend({
    Model : null,

    init : function() {
      this.Model = construct.apply(this.constructor.MODEL_CLASS, arguments);
      this._initView(this.constructor.VIEW_CLASS, this.Model);
    },

    render : function( $parent, ViewClass ) {
      ViewClass = ViewClass || this.constructor.VIEW_CLASS;

      this.requestView( ViewClass );
      this.View.render( $parent );
    },

    destroy : function() {
      this.View.destroy();
      this.Model.destroy();
      this.Model = this.View = null;
    },

    requestView : function( ViewClass ) {
      if ( this.View instanceof ViewClass ) { return; }
      this.switchView(ViewClass, this.Model);
    }
  },{
    // Corresponding Entity View class
    VIEW_CLASS : View,

    // Corresponding Entity Model class
    MODEL_CLASS : Model
  }); // Entity Controller

  return constructor;

});
