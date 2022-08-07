(function(root) {
/**
 * @license almond 0.3.3 Copyright jQuery Foundation and other contributors.
 * Released under MIT license, http://github.com/requirejs/almond/LICENSE
 */
//Going sloppy to avoid 'use strict' string cost, but strict practices should
//be followed.
/*global setTimeout: false */

var requirejs, require, define;
(function (undef) {
    var main, req, makeMap, handlers,
        defined = {},
        waiting = {},
        config = {},
        defining = {},
        hasOwn = Object.prototype.hasOwnProperty,
        aps = [].slice,
        jsSuffixRegExp = /\.js$/;

    function hasProp(obj, prop) {
        return hasOwn.call(obj, prop);
    }

    /**
     * Given a relative module name, like ./something, normalize it to
     * a real name that can be mapped to a path.
     * @param {String} name the relative name
     * @param {String} baseName a real name that the name arg is relative
     * to.
     * @returns {String} normalized name
     */
    function normalize(name, baseName) {
        var nameParts, nameSegment, mapValue, foundMap, lastIndex,
            foundI, foundStarMap, starI, i, j, part, normalizedBaseParts,
            baseParts = baseName && baseName.split("/"),
            map = config.map,
            starMap = (map && map['*']) || {};

        //Adjust any relative paths.
        if (name) {
            name = name.split('/');
            lastIndex = name.length - 1;

            // If wanting node ID compatibility, strip .js from end
            // of IDs. Have to do this here, and not in nameToUrl
            // because node allows either .js or non .js to map
            // to same file.
            if (config.nodeIdCompat && jsSuffixRegExp.test(name[lastIndex])) {
                name[lastIndex] = name[lastIndex].replace(jsSuffixRegExp, '');
            }

            // Starts with a '.' so need the baseName
            if (name[0].charAt(0) === '.' && baseParts) {
                //Convert baseName to array, and lop off the last part,
                //so that . matches that 'directory' and not name of the baseName's
                //module. For instance, baseName of 'one/two/three', maps to
                //'one/two/three.js', but we want the directory, 'one/two' for
                //this normalization.
                normalizedBaseParts = baseParts.slice(0, baseParts.length - 1);
                name = normalizedBaseParts.concat(name);
            }

            //start trimDots
            for (i = 0; i < name.length; i++) {
                part = name[i];
                if (part === '.') {
                    name.splice(i, 1);
                    i -= 1;
                } else if (part === '..') {
                    // If at the start, or previous value is still ..,
                    // keep them so that when converted to a path it may
                    // still work when converted to a path, even though
                    // as an ID it is less than ideal. In larger point
                    // releases, may be better to just kick out an error.
                    if (i === 0 || (i === 1 && name[2] === '..') || name[i - 1] === '..') {
                        continue;
                    } else if (i > 0) {
                        name.splice(i - 1, 2);
                        i -= 2;
                    }
                }
            }
            //end trimDots

            name = name.join('/');
        }

        //Apply map config if available.
        if ((baseParts || starMap) && map) {
            nameParts = name.split('/');

            for (i = nameParts.length; i > 0; i -= 1) {
                nameSegment = nameParts.slice(0, i).join("/");

                if (baseParts) {
                    //Find the longest baseName segment match in the config.
                    //So, do joins on the biggest to smallest lengths of baseParts.
                    for (j = baseParts.length; j > 0; j -= 1) {
                        mapValue = map[baseParts.slice(0, j).join('/')];

                        //baseName segment has  config, find if it has one for
                        //this name.
                        if (mapValue) {
                            mapValue = mapValue[nameSegment];
                            if (mapValue) {
                                //Match, update name to the new value.
                                foundMap = mapValue;
                                foundI = i;
                                break;
                            }
                        }
                    }
                }

                if (foundMap) {
                    break;
                }

                //Check for a star map match, but just hold on to it,
                //if there is a shorter segment match later in a matching
                //config, then favor over this star map.
                if (!foundStarMap && starMap && starMap[nameSegment]) {
                    foundStarMap = starMap[nameSegment];
                    starI = i;
                }
            }

            if (!foundMap && foundStarMap) {
                foundMap = foundStarMap;
                foundI = starI;
            }

            if (foundMap) {
                nameParts.splice(0, foundI, foundMap);
                name = nameParts.join('/');
            }
        }

        return name;
    }

    function makeRequire(relName, forceSync) {
        return function () {
            //A version of a require function that passes a moduleName
            //value for items that may need to
            //look up paths relative to the moduleName
            var args = aps.call(arguments, 0);

            //If first arg is not require('string'), and there is only
            //one arg, it is the array form without a callback. Insert
            //a null so that the following concat is correct.
            if (typeof args[0] !== 'string' && args.length === 1) {
                args.push(null);
            }
            return req.apply(undef, args.concat([relName, forceSync]));
        };
    }

    function makeNormalize(relName) {
        return function (name) {
            return normalize(name, relName);
        };
    }

    function makeLoad(depName) {
        return function (value) {
            defined[depName] = value;
        };
    }

    function callDep(name) {
        if (hasProp(waiting, name)) {
            var args = waiting[name];
            delete waiting[name];
            defining[name] = true;
            main.apply(undef, args);
        }

        if (!hasProp(defined, name) && !hasProp(defining, name)) {
            throw new Error('No ' + name);
        }
        return defined[name];
    }

    //Turns a plugin!resource to [plugin, resource]
    //with the plugin being undefined if the name
    //did not have a plugin prefix.
    function splitPrefix(name) {
        var prefix,
            index = name ? name.indexOf('!') : -1;
        if (index > -1) {
            prefix = name.substring(0, index);
            name = name.substring(index + 1, name.length);
        }
        return [prefix, name];
    }

    //Creates a parts array for a relName where first part is plugin ID,
    //second part is resource ID. Assumes relName has already been normalized.
    function makeRelParts(relName) {
        return relName ? splitPrefix(relName) : [];
    }

    /**
     * Makes a name map, normalizing the name, and using a plugin
     * for normalization if necessary. Grabs a ref to plugin
     * too, as an optimization.
     */
    makeMap = function (name, relParts) {
        var plugin,
            parts = splitPrefix(name),
            prefix = parts[0],
            relResourceName = relParts[1];

        name = parts[1];

        if (prefix) {
            prefix = normalize(prefix, relResourceName);
            plugin = callDep(prefix);
        }

        //Normalize according
        if (prefix) {
            if (plugin && plugin.normalize) {
                name = plugin.normalize(name, makeNormalize(relResourceName));
            } else {
                name = normalize(name, relResourceName);
            }
        } else {
            name = normalize(name, relResourceName);
            parts = splitPrefix(name);
            prefix = parts[0];
            name = parts[1];
            if (prefix) {
                plugin = callDep(prefix);
            }
        }

        //Using ridiculous property names for space reasons
        return {
            f: prefix ? prefix + '!' + name : name, //fullName
            n: name,
            pr: prefix,
            p: plugin
        };
    };

    function makeConfig(name) {
        return function () {
            return (config && config.config && config.config[name]) || {};
        };
    }

    handlers = {
        require: function (name) {
            return makeRequire(name);
        },
        exports: function (name) {
            var e = defined[name];
            if (typeof e !== 'undefined') {
                return e;
            } else {
                return (defined[name] = {});
            }
        },
        module: function (name) {
            return {
                id: name,
                uri: '',
                exports: defined[name],
                config: makeConfig(name)
            };
        }
    };

    main = function (name, deps, callback, relName) {
        var cjsModule, depName, ret, map, i, relParts,
            args = [],
            callbackType = typeof callback,
            usingExports;

        //Use name if no relName
        relName = relName || name;
        relParts = makeRelParts(relName);

        //Call the callback to define the module, if necessary.
        if (callbackType === 'undefined' || callbackType === 'function') {
            //Pull out the defined dependencies and pass the ordered
            //values to the callback.
            //Default to [require, exports, module] if no deps
            deps = !deps.length && callback.length ? ['require', 'exports', 'module'] : deps;
            for (i = 0; i < deps.length; i += 1) {
                map = makeMap(deps[i], relParts);
                depName = map.f;

                //Fast path CommonJS standard dependencies.
                if (depName === "require") {
                    args[i] = handlers.require(name);
                } else if (depName === "exports") {
                    //CommonJS module spec 1.1
                    args[i] = handlers.exports(name);
                    usingExports = true;
                } else if (depName === "module") {
                    //CommonJS module spec 1.1
                    cjsModule = args[i] = handlers.module(name);
                } else if (hasProp(defined, depName) ||
                           hasProp(waiting, depName) ||
                           hasProp(defining, depName)) {
                    args[i] = callDep(depName);
                } else if (map.p) {
                    map.p.load(map.n, makeRequire(relName, true), makeLoad(depName), {});
                    args[i] = defined[depName];
                } else {
                    throw new Error(name + ' missing ' + depName);
                }
            }

            ret = callback ? callback.apply(defined[name], args) : undefined;

            if (name) {
                //If setting exports via "module" is in play,
                //favor that over return value and exports. After that,
                //favor a non-undefined return value over exports use.
                if (cjsModule && cjsModule.exports !== undef &&
                        cjsModule.exports !== defined[name]) {
                    defined[name] = cjsModule.exports;
                } else if (ret !== undef || !usingExports) {
                    //Use the return value from the function.
                    defined[name] = ret;
                }
            }
        } else if (name) {
            //May just be an object definition for the module. Only
            //worry about defining if have a module name.
            defined[name] = callback;
        }
    };

    requirejs = require = req = function (deps, callback, relName, forceSync, alt) {
        if (typeof deps === "string") {
            if (handlers[deps]) {
                //callback in this case is really relName
                return handlers[deps](callback);
            }
            //Just return the module wanted. In this scenario, the
            //deps arg is the module name, and second arg (if passed)
            //is just the relName.
            //Normalize module name, if it contains . or ..
            return callDep(makeMap(deps, makeRelParts(callback)).f);
        } else if (!deps.splice) {
            //deps is a config object, not an array.
            config = deps;
            if (config.deps) {
                req(config.deps, config.callback);
            }
            if (!callback) {
                return;
            }

            if (callback.splice) {
                //callback is an array, which means it is a dependency list.
                //Adjust args if there are dependencies
                deps = callback;
                callback = relName;
                relName = null;
            } else {
                deps = undef;
            }
        }

        //Support require(['a'])
        callback = callback || function () {};

        //If relName is a function, it is an errback handler,
        //so remove it.
        if (typeof relName === 'function') {
            relName = forceSync;
            forceSync = alt;
        }

        //Simulate async callback;
        if (forceSync) {
            main(undef, deps, callback, relName);
        } else {
            //Using a non-zero value because of concern for what old browsers
            //do, and latest browsers "upgrade" to 4 if lower value is used:
            //http://www.whatwg.org/specs/web-apps/current-work/multipage/timers.html#dom-windowtimers-settimeout:
            //If want a value immediately, use require('id') instead -- something
            //that works in almond on the global level, but not guaranteed and
            //unlikely to work in other AMD implementations.
            setTimeout(function () {
                main(undef, deps, callback, relName);
            }, 4);
        }

        return req;
    };

    /**
     * Just drops the config on the floor, but returns req in case
     * the config return value is used.
     */
    req.config = function (cfg) {
        return req(cfg);
    };

    /**
     * Expose module registry for debugging and tooling
     */
    requirejs._defined = defined;

    define = function (name, deps, callback) {
        if (typeof name !== 'string') {
            throw new Error('See almond README: incorrect module build, no module name');
        }

        //This module may not have dependencies
        if (!deps.splice) {
            //deps is not an array, so probably means
            //an object literal or factory function for
            //the value. Adjust args.
            callback = deps;
            deps = [];
        }

        if (!hasProp(defined, name) && !hasProp(waiting, name)) {
            waiting[name] = [name, deps, callback];
        }
    };

    define.amd = {
        jQuery: true
    };
}());

define("node_modules/almond/almond", function(){});

/**
 * Behanced Class
 * Built from Simple JS Inheritance by John Resig
 * Addons:
 * - Static properties inheritance
 * - init() auto-calls super's init()
 * - can prevent auto-calling with stat._
 * - mixin() for implementing abstracts
 */
/*global xyz */
define('nbd/Class',[],function() {
  "use strict";

  var Klass, extend, mixin, inherits,
  fnTest = /xyz/.test(function(){return xyz;}) ? /\b_super\b/ : /.*/;

  function chainFn(parent, child) {
    return function() {
      parent.apply(this, arguments);
      return child.apply(this, arguments);
    };
  }

  // Create a new Class that inherits from this class
  extend = function(prop, stat) {
    var prototype, name, initfn, _super = this.prototype;

    // Instantiate a base class (but only create the instance,
    // don't run the init constructor)
    prototype = Object.create(_super);

    function protochain(name, fn, initfn) {
      var applySuper = function() {return _super[name].apply(this,arguments);};
      return function() {
        var hadSuper = this.hasOwnProperty('_super'), tmp = this._super;

        // Add a new ._super() method that is the same method
        // but on the super-class
        this._super = applySuper;

        // The method only need to be bound temporarily, so we
        // remove it when we're done executing
        try {
          // Addon: calling up the init chain
          if (initfn) { this._super.apply(this, arguments); }

          return fn.apply(this, arguments);
        }
        catch(e) {
          // Rethrow catch for IE 8
          throw e;
        }
        finally {
          if (hadSuper) {this._super = tmp;}
        }
      };
    }

    // Copy the properties over onto the new prototype
    for (name in prop) {
      if ( prop.hasOwnProperty(name) ) {
        // Addon: check for need to call up the chain
        initfn = name === "init" && !(stat && stat.hasOwnProperty("_") && stat._);

        // Check if we're overwriting an existing function
        prototype[name] =
          typeof prop[name] === "function" &&
          typeof _super[name] === "function" &&
          (initfn || fnTest.test(prop[name])) ?
          protochain(name, prop[name], initfn) :
          prop[name];
      }
    }

    // The dummy class constructor
    function Class() {
      // All construction is actually done in the init method
      if ( typeof this.init === "function" ) {
        this.init.apply(this, arguments);
      }
    }

    // Addon: copy the superclass's stat properties
    for (name in this) {
      if (this.hasOwnProperty(name)) {
        Class[name] = this[name];
      }
    }

    // Addon: override the provided stat properties
    for (name in stat) {
      if (stat.hasOwnProperty(name)) {
        initfn = name === "init" &&
            !(stat && stat.hasOwnProperty("_") && stat._);
        Class[name] = initfn &&
          typeof Class[name] === "function" &&
          typeof stat[name] === "function" ?
          chainFn(Class[name], stat[name]) :
          stat[name];
      }
    }

    // Populate our constructed prototype object
    Class.prototype = prototype;

    // Enforce the constructor to be what we expect
    Object.defineProperty(Class.prototype, "constructor", {value:Class});

    // Class guaranteed methods
    Object.defineProperties(Class, {
      extend: {value:extend, enumerable:false},
      mixin : {value:mixin},
      inherits: {value:inherits}
    });

    return Class;
  };

  // allows adding any object's properties into the class
  mixin = function(abstract) {
    var descriptor = {};
    Object.keys(abstract).forEach(function(prop) {
      descriptor[prop] = {
        configurable:false,
        value:abstract[prop]
      };
    });
    Object.defineProperties(this.prototype, descriptor);
    return this;
  };

  // determines if current class inherits from superclass
  inherits = function(superclass) {
    var prop, result = false;
    if (typeof superclass === 'function') {
      // Testing linear inheritance
      return superclass.prototype.isPrototypeOf( this.prototype );
    }
    if (typeof superclass === 'object') {
      // Testing horizontal inheritance
      result = true;
      for (prop in superclass) {
        if (superclass.hasOwnProperty(prop) &&
            superclass[prop] !== this.prototype[prop]) {
          result = false;
          break;
        }
      }
    }
    return result;
  };

  // The base Class implementation (does nothing)
  Klass = function() {};
  Klass.extend = extend;

  return Klass;
});

/**
 * Utility function to break out of the current JavaScript callstack
 * Uses window.postMessage if available, falls back to window.setTimeout
 * @see https://developer.mozilla.org/en-US/docs/DOM/window.setTimeout#Minimum_delay_and_timeout_nesting
 * @module util/async
 */
/*global postMessage, addEventListener */
define('nbd/util/async',[],function() {
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

define('nbd/util/extend',[],function() {
  'use strict';

  return function(obj) {
    var i, prop, source;
    for (i=1; i<arguments.length; ++i) {
      source = arguments[i];
      for (prop in source) {
        obj[prop] = source[prop];
      }
    }
    return obj;
  };
});

define('nbd/util/diff',['./extend'], function(extend) {
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

// Backbone.Events
// ---------------
define('nbd/trait/pubsub',[],function() {
  'use strict';

  // Regular expression used to split event strings
  var eventSplitter = /\s+/,

  uId = function uid(prefix) {
    uid.i = uid.i || 0;
    return (prefix || '') + (++uid.i);
  };

  // A module that can be mixed in to *any object* in order to provide it with
  // custom events. You may bind with `on` or remove with `off` callback functions
  // to an event; `trigger`-ing an event fires all callbacks in succession.
  return {

    // Bind one or more space separated events, `events`, to a `callback`
    // function. Passing `"all"` will bind the callback to all events fired.
    on: function(events, callback, context) {
      var calls, event, list;
      if (!callback) { return this; }

      events = events.split(eventSplitter);

      if (!this._callbacks) {
        Object.defineProperty(this, '_callbacks', {
          configurable: true,
          value: {},
          writable: true
        });
      }
      calls = this._callbacks;

      while (event = events.shift()) {
        list = calls[event] || (calls[event] = []);
        list.push(callback, context);
      }

      return this;
    },

    // Remove one or many callbacks. If `context` is null, removes all callbacks
    // with that function. If `callback` is null, removes all callbacks for the
    // event. If `events` is null, removes all bound callbacks for all events.
    off: function(events, callback, context) {
      var event, calls, list, i;

      // No events, or removing *all* events.
      if (!(calls = this._callbacks)) { return this; }
      if (!(events || callback || context)) {
        delete this._callbacks;
        return this;
      }

      events = events ? events.split(eventSplitter) : Object.keys(calls);

      // Loop through the callback list, splicing where appropriate.
      while (event = events.shift()) {
        if (!(list = calls[event]) || !(callback || context)) {
          delete calls[event];
          continue;
        }

        for (i = list.length - 2; i >= 0; i -= 2) {
          if (!(callback && list[i] !== callback || context && list[i + 1] !== context)) {
            list.splice(i, 2);
          }
        }
      }

      return this;
    },

    // Trigger one or many events, firing all bound callbacks. Callbacks are
    // passed the same arguments as `trigger` is, apart from the event name
    // (unless you're listening on `"all"`, which will cause your callback to
    // receive the true name of the event as the first argument).
    trigger: function(events) {
      var event, calls, list, i, length, args, all, rest;
      if (!(calls = this._callbacks)) { return this; }

      rest = [];
      events = events.split(eventSplitter);

      // Fill up `rest` with the callback arguments. Since we're only copying
      // the tail of `arguments`, a loop is much faster than Array#slice.
      for (i = 1, length = arguments.length; i < length; i++) {
        rest[i - 1] = arguments[i];
      }

      // For each event, walk through the list of callbacks twice, first to
      // trigger the event, then to trigger any `"all"` callbacks.
      while (event = events.shift()) {
        // Copy callback lists to prevent modification.
        if (all = calls.all) all = all.slice();
        if (list = calls[event]) list = list.slice();

        // Execute event callbacks.
        if (list) {
          for (i = 0, length = list.length; i < length; i += 2) {
            list[i].apply(list[i + 1] || this, rest);
          }
        }

        // Execute "all" callbacks.
        if (all) {
          args = [event].concat(rest);
          for (i = 0, length = all.length; i < length; i += 2) {
            all[i].apply(all[i + 1] || this, args);
          }
        }
      }

      return this;
    },

    // An inversion-of-control version of `on`. Tell *this* object to listen to
    // an event in another object ... keeping track of what it's listening to.
    listenTo: function(object, events, callback) {
      var listeners = this._listeners || (this._listeners = {});
      var id = object._listenerId || (object._listenerId = uId('l'));
      listeners[id] = object;
      object.on(events, callback || this, this);
      return this;
    },

    // Tell this object to stop listening to either specific events ... or
    // to every object it's currently listening to.
    stopListening: function(object, events, callback) {
      var listeners = this._listeners;
      if (!listeners) return;
      if (object) {
        object.off(events, callback, this);
        if (!events && !callback) delete listeners[object._listenerId];
      } else {
        for (var id in listeners) {
          listeners[id].off(null, null, this);
        }
        this._listeners = {};
      }
      return this;
    }

  };
});

define('nbd/Model',['./Class',
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

define('nbd/View',['./Class', './trait/pubsub'], function(Class, pubsub) {
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

define('nbd/View/Entity',['../View'], function(View) {
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

define('nbd/View/Element',['../View'], function(View) {
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

define('nbd/util/construct',[],function() {
  'use strict';

  var toStr = Object.prototype.toString;

  return function construct() {
    // Type check this is a function
    if ( !(toStr.call(this).indexOf('Function')+1) ) {
      throw new TypeError('construct called on incompatible Object');
    }

    var inst = Object.create(this.prototype),
    ret = this.apply(inst, arguments);
    // Follow new behavior when constructor returns a value
    return Object(ret) === ret ? ret : inst;
  };
});

define('nbd/Controller',['./Class',
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

define('nbd/Controller/Entity',['../util/construct',
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

define('nbd/event',['./util/extend', './trait/pubsub'], function(extend, pubsub) {
  'use strict';

  var exports = extend({}, pubsub);

  // Aliases
  exports.bind = exports.on;
  exports.unbind = exports.off;
  exports.fire = exports.trigger;

  return exports;
});

define('nbd/trait/promise',['../util/async', '../util/extend'], function(async, extend) {
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

/*
 * Extraction of the deparam method from Ben Alman's jQuery BBQ
 * @see http://benalman.com/projects/jquery-bbq-plugin/
 */
define('nbd/util/deparam',[],function() {
  'use strict';

  return function (params, coerce) {
    var obj = {},
        coerce_types = { 'true': true, 'false': false, 'null': null };

    // Iterate over all name=value pairs.
    params.replace(/\+/g, ' ').split('&').forEach(function (v) {
      var param = v.split('='),
          key = decodeURIComponent(param[0]),
          val,
          cur = obj,
          i = 0,

          // If key is more complex than 'foo', like 'a[]' or 'a[b][c]', split it
          // into its component parts.
          keys = key.split(']['),
          keys_last = keys.length - 1;

      // If the first keys part contains [ and the last ends with ], then []
      // are correctly balanced.
      if (/\[/.test(keys[0]) && /\]$/.test(keys[keys_last])) {
        // Remove the trailing ] from the last keys part.
        keys[keys_last] = keys[keys_last].replace(/\]$/, '');

        // Split first keys part into two parts on the [ and add them back onto
        // the beginning of the keys array.
        keys = keys.shift().split('[').concat(keys);

        keys_last = keys.length - 1;
      } else {
        // Basic 'foo' style key.
        keys_last = 0;
      }

      // Are we dealing with a name=value pair, or just a name?
      if (param.length === 2) {
        val = decodeURIComponent(param[1]);

        // Coerce values.
        if (coerce) {
          val = val && !isNaN(val)              ? +val              // number
              : val === 'undefined'             ? undefined         // undefined
              : coerce_types[val] !== undefined ? coerce_types[val] // true, false, null
              : val;                                                // string
        }

        if ( keys_last ) {
          // Complex key, build deep object structure based on a few rules:
          // * The 'cur' pointer starts at the object top-level.
          // * [] = array push (n is set to array length), [n] = array if n is
          //   numeric, otherwise object.
          // * If at the last keys part, set the value.
          // * For each keys part, if the current level is undefined create an
          //   object or array based on the type of the next keys part.
          // * Move the 'cur' pointer to the next level.
          // * Rinse & repeat.
          for (i; i <= keys_last; i++) {
            key = keys[i] === '' ? cur.length : keys[i];
            cur = cur[key] = i < keys_last
              ? cur[key] || (keys[i+1] && isNaN(keys[i+1]) ? {} : [])
              : val;
          }

        } else {
          // Simple key, even simpler rules, since only scalars and shallow
          // arrays are allowed.

          if (Array.isArray(obj[key])) {
            // val is already an array, so push on the next value.
            obj[key].push( val );

          } else if (obj[key] !== undefined) {
            // val isn't an array, but since a second value has been specified,
            // convert val into an array.
            obj[key] = [obj[key], val];

          } else {
            // val is a scalar.
            obj[key] = val;
          }
        }

      } else if (key) {
        // No value was defined, so set something meaningful.
        obj[key] = coerce
          ? undefined
          : '';
      }
    });

    return obj;
  };

});

/**
 * Responsive media query callbacks
 * @see https://developer.mozilla.org/en-US/docs/DOM/Using_media_queries_from_code
 */
/*global matchMedia, msMatchMedia */
define('nbd/util/media',['./extend', '../trait/pubsub'], function(extend, pubsub) {
  'use strict';

  var queries = {},
  mqChange,
  mMedia = typeof matchMedia !== 'undefined' ? matchMedia :
           typeof msMatchMedia !== 'undefined' ? msMatchMedia :
           null;

  function bindMedia( breakpoint, query ) {
    var match = mMedia( query );
    queries[breakpoint] = match;
    match.addListener( mqChange.bind(match, breakpoint) );
    if (match.matches) { mqChange.call(match, breakpoint); }
  }

  function isActive(breakpoint) {
    return queries[breakpoint] && queries[breakpoint].matches;
  }

  function media( options, query ) {
    var breakpoint;

    // No matchMedia support
    if ( !mMedia ) {
      throw new Error('Media queries not supported.');
    }

    // Has matchMedia support
    if ( typeof options === 'string' ) {
      bindMedia( options, query );
      return media;
    }

    if ( typeof options === 'object' ) {
      for (breakpoint in options) {
        if (options.hasOwnProperty(breakpoint)) {
          query = options[breakpoint];
          bindMedia( breakpoint, query );
        }
      }
    }
    return media;

  }

  extend(media, pubsub);

  mqChange = function(breakpoint) {
    media.trigger(breakpoint + (this.matches ? ':enter' : ':exit'));
    media.trigger(breakpoint, this.matches);
  };

  media.is = isActive;
  media.getState = function(breakpoint) {
    if ( breakpoint ) {
      return isActive(breakpoint);
    }

    return Object.keys(queries).filter(isActive);
  };

  return media;

});

define('nbd/util/pipe',[],function() {
  'use strict';
  return function chain() {
    var chainArgs = arguments;
    return function() {
      var i, retval;
      for (i=0; i<chainArgs.length; ++i) {
        retval=chainArgs[i].apply(this, i===0?arguments:[retval]);
      }
      return retval;
    };
  };
});

/**
 * Prototype chain append utility
 * Inspired by Mozilla's Object.appendChain()
 * @see https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Object/GetPrototypeOf#Notes
 */
define('nbd/util/protochain',[],function() {
  'use strict';

  function swapProto(lProto, oProto) {
    var inst, p;

    if ((p=Object.getPrototypeOf(lProto)) !== Object.prototype) {
      swapProto(p, oProto); //?
      oProto = p.constructor.prototype;
    }

    inst = Object.create(oProto);
    for (p in lProto) {
      if (lProto.hasOwnProperty(p)) {
        inst[p] = lProto[p];
      }
    }
    inst.constructor = lProto.constructor;
    lProto.constructor.prototype = inst;

  }

  return function(Klass, Class, forced) {
    if (arguments.length < 2) {
      throw new TypeError("Not enough arguments");
    }
    if (typeof Klass !== "function") {
      throw new TypeError("First argument must be a constructor");
    }
    if (typeof Class !== "function") {
      throw new TypeError("Second argument must be a constructor");
    }

    var it = Klass.prototype, up;

    // Find the top non-native prototype
    while ((up=Object.getPrototypeOf(it)) !== Object.prototype) { it = up; }

    if (forced !== true) {
      // Try to modify the chain seamlessly if possible
      if (it.__proto__) {
        it.__proto__ = Class.prototype;
        return;
      }
      throw new Error("Cannot modify prototype chain");
    }

    swapProto(Klass.prototype, Class.prototype);
  }
});


define('build/all',[
       'nbd/Class',
       'nbd/Model',
       'nbd/View',
       'nbd/View/Entity',
       'nbd/View/Element',
       'nbd/Controller',
       'nbd/Controller/Entity',
       'nbd/event',
       'nbd/trait/promise',
       'nbd/trait/pubsub',
       'nbd/util/async',
       'nbd/util/construct',
       'nbd/util/deparam',
       'nbd/util/diff',
       'nbd/util/extend',
       'nbd/util/media',
       'nbd/util/pipe',
       'nbd/util/protochain'
], function(Class, Model, View, EntityView, ElementView, Controller, Entity, event, promise, pubsub, async, construct, deparam, diff, extend, media, pipe, protochain) {
  'use strict';

  var exports = {
    Class : Class,
    Model : Model,
    View : View,
    Controller : Controller,
    event : event,
    trait : {
      promise : promise,
      pubsub : pubsub
    },
    util : {
      async : async,
      construct : construct,
      deparam : deparam,
      diff : diff,
      extend : extend,
      media : media,
      pipe : pipe,
      protochain : protochain
    }
  };

  exports.View.Element = ElementView;
  exports.View.Entity = EntityView;
  exports.Controller.Entity = Entity;

  return exports;
});

root.nbd = require('build/all'); })(this);
