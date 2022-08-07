define(['jquery'], function($) {
  'use strict';

  return {

    template : function() {
      var script = this.templateScript();
      return script.tmpl.apply(script, arguments);
    },

    templateScript : function( strict ) {

      strict = ( typeof strict !== 'undefined' ) ? strict : true;

      if ( !this.constructor.$TEMPLATE || !this.constructor.$TEMPLATE.length ) {
        this.constructor.$TEMPLATE = $( '#' + this.constructor.TEMPLATE_ID );
      }

      if ( !this.constructor.$TEMPLATE.length ) {

        if ( strict === true ) {
          $.error( 'Missing template: ' + this.constructor.TEMPLATE_ID );
        }
        else {
          return false;
        }

      } // if !$TEMPLATE or !$TEMPLATE length

      return this.constructor.$TEMPLATE;

    }
  };

});
