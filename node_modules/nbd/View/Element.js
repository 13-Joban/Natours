define(['../View'], function(View) {
  "use strict";

  var constructor = View.extend({

    $parent: null,

    init : function( $parent ) {
      this.$parent = $parent;
    },

    render : function( data ) {
      var $existing = this.$view;

      this.trigger('prerender');

      this.$view = this.template(data || this.templateData());

      if ( $existing && $existing.length ) {
        $existing.replaceWith( this.$view );
      }
      else {
        this.$view.appendTo( this.$parent );
      }

      this.trigger('postrender', this.$view);

      if(this.rendered) {
        this.rendered(this.$view);
      }

      return this.$view;
    }

  });

  return constructor;

});
