define(['../util/async', '../util/extend'], function(async, extend) {
  'use strict';

  function Promise() {
    var self = this,
    onResolve = [],
    onReject = [],
    state = 0,
    value;

    function call(fns) {
      if (fns.length) {
        async(function() {
          for (var i=0; i<fns.length; ++i) { fns[i](value); }
        });
      }
      // Reset callbacks
      onResolve = onReject = [];
    }

    function fulfill(x) {
      if (state) { return; }
      state = 1;
      value = x;
      call(onResolve);
    }

    function reject(reason) {
      if (state) { return; }
      state = -1;
      value = reason;
      call(onReject);
    }

    function resolve(x) {
      if (x === self) {
        throw new TypeError('Cannot resolve with self');
      }

      // If handed another promise
      if (x instanceof Promise) {
        x.then(resolve, reject);
        return;
      }

      // If handed another then-able
      try {
        if ((typeof x === 'object' || typeof x === 'function') &&
            x !== null && typeof x.then === 'function') {
          return (function thenAble() {
            var mutex = false;

            try {
              x.then(function resolvePromise(y) {
                if (mutex) { return; }
                if (x === y) { fulfill(x); }
                else { resolve(y); }
                mutex = true;
              }, function rejectPromise(r) {
                if (mutex) { return; }
                reject(r);
                mutex = true;
              });
            }
            catch (e) { if (!mutex) { reject(e); } }
          }());
        }
      }
      catch (e) {
        reject(e);
        return;
      }

      fulfill(x);
    }

    function then(onFulfilled, onRejected) {
      var next = new Promise();

      function wrap(fn) {
        return function(x) {
          var retval;
          try {
            retval = fn(x);
          }
          catch(e) {
            next.reject(e);
          }
          next.resolve(retval);
        };
      }

      // Promise pending
      if (!state) {
        onResolve.push(typeof onFulfilled === 'function' ?
                       wrap(onFulfilled) :
                       next.resolve);

        onReject.push(typeof onRejected === 'function' ?
                      wrap(onRejected) :
                      next.reject);
      }
      // Promise fulfilled/rejected
      else {
        var toCall = state > 0 ? onFulfilled : onRejected;
        if (typeof toCall === 'function') {
          toCall = wrap(toCall);
          async(function() { toCall(value); });
        }
        else {
          next[ state > 0 ? 'resolve' : 'reject' ](value);
        }
      }

      return next;
    }

    Object.defineProperties(this, {
      reject : {value: reject},
      resolve: {value: resolve}
    });

    this.then = then;
  }

  Promise.prototype.thenable = function() {
    return { then : this.then };
  };

  Promise.prototype.promise = function() {
    var then = this.then,
    retSelf = function() {return api;},
    api = {
      done : function() {
        var fns = Array.prototype.concat.apply([], arguments);
        fns.forEach(function(fn) { then(fn); });
        return api;
      },
      fail : function() {
        var fns = Array.prototype.concat.apply([], arguments);
        fns.forEach(function(fn) { then(undefined, fn); });
        return api;
      },
      then : then,
      progress : retSelf,
      promise : retSelf
    };

    return api;
  };

  var promiseMe = function() {
    // Ensure there is a promise instance
    if (!this._promise) {
      Object.defineProperty(this, '_promise', {value: new Promise()});
    }
  };

  extend(Promise, {
    then: function(onFulfilled, onRejected) {
      promiseMe.call(this);
      return this._promise.then(onFulfilled, onRejected);
    },

    resolve: function(value) {
      promiseMe.call(this);
      this._promise.resolve(value);
      return this;
    },

    reject: function(value) {
      promiseMe.call(this);
      this._promise.reject(value);
      return this;
    },

    thenable: function() {
      promiseMe.call(this);
      return this._promise.thenable();
    },

    promise: function() {
      promiseMe.call(this);
      return this._promise.promise();
    }
  });


  return Promise;
});
