define(['./extend'], function(extend) {
  'use strict';

  var stack = [];

  function objectCheck(cur, prev) {
    var key, equal=true;

    // If complex objects, assume different
    if (!(Object.getPrototypeOf(cur) === Object.prototype &&
          Object.getPrototypeOf(prev) === Object.prototype
         )) { return false; }

    for (key in cur) {
      if (cur[key] !== prev[key]) {
        return false;
      }

      if (cur.hasOwnProperty(key) &&
          typeof cur[key] === "object" && cur[key] &&
          Object.getPrototypeOf(cur[key]) === Object.prototype) {
        // Property has been visited, skip
        if (~stack.indexOf(cur[key])) { continue; }

        try {
          stack.push(cur[key]);

          // Recurse into object to find diff
          equal = equal && objectCheck(prev[key], cur[key]);
        }
        catch (emptyArgs) {}
        finally {
          stack.pop();
        }
      }

      if (!equal) { return equal; }
    }

    return equal;
  }

  return function diff(cur, prev, callback) {
    var key, lhs, rhs, difference, differences = {};

    if (typeof prev !== "object" || typeof cur !== "object" ||
        prev === null || cur === null) {
      throw new TypeError('Arguments must be objects');
    }

    // Make a copy of prev for its keys
    prev = extend({}, prev);

    for (key in cur) {
      if (cur.hasOwnProperty(key)) {
        lhs = cur[key];
        rhs = prev[key];
        delete prev[key];

        if (lhs === rhs) { continue; }

        // if either is not a simple object OR objectCheck fails then mark
        if (!(
          typeof lhs === "object" && typeof rhs === "object" &&
          lhs && rhs &&
          objectCheck(lhs, rhs)
        )) {
          differences[key] = [lhs, rhs];
          if (callback) {
            callback.apply(this, [key, lhs, rhs]);
          }
        }
      }
    }

    // Any remaining keys are only in the prev
    for (key in prev) {
      if (prev.hasOwnProperty(key) && prev[key] !== undefined) {
        differences[key] = [cur[key]];
        if (callback) {
          callback.apply(this, [key, undefined, prev[key]]);
        }
      }
    }

    return differences;
  };
});
