# `require('nbd/util/async')`
* [()](#-callback-)

The `async` module is a utility function module. Like all othe utility function modules, it is itself a function that can be called. 

The purpose of `async` is to provide a platform-independent way to make use of timers in JavaScript to start another callstack after the current one.

## `( callback )`
**callback()**

Since JavaScript is primarily a single-threaded environment, execution of another callstack is kicked off with an event. The `async` module makes use of `window.postMessage()` where available in order to register an event as immediate as possible after the current callstack has completed.
Failing `window.postMessage()`, `async` falls back to using `setTimeout()` in order to achieve nearly the same effect, but see [caveats][1].

```javascript
require(['nbd/util/async'], function(async) {
  async(function() {
    console.log('bar');
  });
  console.log('foo'); // Logs 'foo' then 'bar'
});
```

Since the `callback` handed to `async` is executed on a separate callstack guaranteed to be after the current one, one use of the `async` module is to collect all calls to a function, and then only call the function once, if it was called at all.

```javascript
require(['nbd/util/async'], function(async) {
  function fnIface() {
    fnIface.count = fnIface.count || 0;
    if (++fnIface.count === 1) async(fnImpl);
  }

  function fnImpl() {
    fnIface.count = 0;
    /* actual implementation */
  }

  for (var i=0; i<100; ++i) {
    fnIface(); // Only runs fnImpl() once after the loop finishes
  }
});
```

**returns** *nothing*

[1]: http://dbaron.org/log/20100309-faster-timeouts
