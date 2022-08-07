# `require('nbd/trait/promise')`
* [.then()](#then-onfulfilled-onrejected-)
* [.resolve()](#resolve-x-)
* [.reject()](#reject-reason-)
* [.thenable()](#thenable-)
* [.promise()](#promise-)
* [Implementation Notes](#implementation-notes)

Promises are one of the most useful patterns in JavaScript for dealing with the
asynchronous nature of the language. It helps separate concerns and gives the
generic JavaScript callback more context.

**nbd.js** implements [Promise/A+][1] specifications with the `promise` trait.
Therefore, any `Class` that `.mixin()`s the trait can be used with any other
Promise/A+ implementation.

[1]: http://promises-aplus.github.io/promises-spec/

## `.then( onFulfilled, onRejected )`

Binds `onFulfilled` and `onRejected` functions to the promise's fufilled and
rejected states. THe bound functions, when the promise is still pending, will
not be called until the promise is resolved. If called after the promise is
resolved, the parameters will be called immediately, after `.then()` returns.

All callback functions will be called as functions, i.e. they will not be
called with any context.

**returns** *promise* A new promise object that will resolve with the
fulfilled/rejected state and value of the return values of `onFulfilled` or
`onRejected`, respectively.

## `.resolve( x )`

Primary method for resolving a promise's state. If no errors occur, the promise
will be fulfilled with the value of `x`. Otherwise, the promise will be
rejected. 

If `x` is another promise or a then-able pseudo-promise (has the method
`.then()` with the same signature), then the current promise will resolve with
the same state and value as `x`.

Nothing happens if `.resolve()` is called on a promise that's already
been resolved.

**returns** *nothing*

## `.reject( reason )`

Outright rejects a pending promise. The promise will be rejected with the
reason `reason`.

Similar to `.resolve()`, nothing happens if it is called on a promise that's
already been resolved.

**returns** *nothing*

## `.thenable()`

Creates a then-able pseudo-promise object with a single member, the `then()`
that operates on the current promise. This then-able is useful to give only the
ability to add fulfill and reject callbacks without also giving the ability to
resolve.

This `then()` method is context-independent: it can be called from any context
and the promise it applies to remains the same.

**returns** *Object* Then-able pseudo-promise

## `.promise()`

Creates an object with the `done()`, `fail()`, `progress()`, `then()` and
`promise()` methods. This object is used for interoperability with jQuery's
Deferred objects. Instances with the `promise` trait can give their
`.promise()` returns to `jQuery.when()` for creating a single promise out of
many.

```javascript
require(['nbd/Class', 'nbd/trait/promise', 'jquery'],
function(Class, promise, $) {

  var Delayed = new Class.extend().mixin(promise),
  inst1 = new Delayed(),
  inst2 = new Delayed();

  $.when( inst1, inst2 )
  .done(function( retVal1, retVal2 ) {
    console.log( retVal1, retVal2 );
  });

  inst1.resolve( 'foo' );
  // nothing happens

  inst2.resolve( 'bar' );
  // console logs: foo bar

});
```

**returns** *Object* jQuery Deferred-compatible object

## Implementation Notes

The underlying promises are actual objects created and attached to the instance
with `promise` trait. These promise objects have the same methods as the trait.
However, `then()`, `resolve()`, and `reject()` have the added benefit of being
context-independent.

When the trait methods are called, they attach a single seed promise onto
the context as `this._promise`.
