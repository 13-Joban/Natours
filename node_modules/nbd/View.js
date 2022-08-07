define(['./Class', './trait/pubsub'], function(Class, pubsub) {
  "use strict";

  var constructor = Class.extend({

    $view: null,

    render: function(data) {
      var $existing = this.$view;

      this.trigger('prerender');

      this.$view = this.template(data || this.templateData());

      if ( $existing && $existing.length ) {
        $existing.replaceWith( this.$view );
      }

      this.trigger('postrender', this.$view);

      // Prefer the postrender event over this method
      if(this.rendered) {
        this.rendered(this.$view);
      }

      return this.$view;
    },

    template: function() {},
    templateData: function() { return {}; },

    destroy: function() {
      if ( this.$view && this.$view.remove ) {
        this.$view.remove();
      }
      this.$view = null;
      this.off();
    }

  })
  .mixin(pubsub);

  return constructor;

});
