/**
 * Utility function to break out of the current JavaScript callstack
 * Uses window.postMessage if available, falls back to window.setTimeout
 * @see https://developer.mozilla.org/en-US/docs/DOM/window.setTimeout#Minimum_delay_and_timeout_nesting
 * @module util/async
 */
/*global postMessage, addEventListener */
define(function() {
  'use strict';

  var timeouts = [],
  messageName = "async-message",
  hasPostMessage = (
    typeof postMessage === "function" &&
    typeof addEventListener === "function"
  ),
  async;

  /**
   * Like setTimeout, but only takes a function argument.  There's
   * no time argument (always zero) and no arguments (you have to
   * use a closure).
   */
  function setZeroTimeout(fn) {
    timeouts.push(fn);
    postMessage(messageName, "*");
  }

  function handleMessage(event) {
    if (event.source === window && event.data === messageName) {
      event.stopPropagation();
      if (timeouts.length > 0) {
        var fn = timeouts.shift();
        fn();
      }
    }
  }

  if ( hasPostMessage ) {
    addEventListener("message", handleMessage, true);
  }

  /** @alias module:util/async */
  async = (hasPostMessage ? setZeroTimeout : function(fn) {setTimeout(fn,0);});

  return async;
});
