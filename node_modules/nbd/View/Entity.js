define(['../View'], function(View) {
  "use strict";

  var constructor = View.extend({

    init : function( model ) {
      if (typeof model === 'object') {
        this._model = this.Model = model;
      }

      this.id = (model && model.id) || function() {
        return model;
      };
    },

    destroy : function(persist) {
      this._model.off(null, null, this);
      if (!persist) {
        this._model = this.Model = null;
      }
      this._super();
    },

    // all data needed to template the view
    templateData : function() {
      return (this._model && this._model.data) ? this._model.data() : this.id();
    },

    render : function( $parent ) {

      // $existing could be a string
      var $existing = this.$view,
          fresh = !($existing && $parent);

      if ( fresh ) {
        this.trigger('prerender');
        this.$view = this.template( this.templateData() );
      }

      if ( $parent ) {
        if ( this.$view ) { this.$view.appendTo( $parent ); }
      }
      else {
        if ( $existing ) { $existing.replaceWith( this.$view ); }
      }

      if ( fresh ) {
        this.trigger('postrender', this.$view);

        if ( typeof this.rendered === 'function' ) {
          this.rendered(this.$view);
        }
      }

      return this.$view;

    } // render

  }); // View Entity

  return constructor;

});
