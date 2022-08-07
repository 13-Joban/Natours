# `require('nbd/trait/pubsub')`
* [.on()](#on-event-callback-context-)
* [.off()](#off-event-callback-context-)
* [.trigger()](#trigger-event-args-)
* [.listenTo()](#listento-publisher-event-callback-)
* [.stopListening()](#stoplistening-publisher-event-callback-)

The publisher-subscriber pattern is a well established event-based pattern that **nbd.js** uses heavily. In order to provide an implementation for that pattern across many different use cases, **nbd.js** uses the `pubsub` trait.

Traits are simply objects that, when `extend()`ed or `.mixin()`ed into objects or Classes, provide that functionality. Complex pieces of functionality can then be quickly assembled from various traits.

The implementation of `pubsub` is derived from [Backbone.Events][1].

[1]: http://backbonejs.org/#Events

## `.on( event, callback[, context] )`

Binds the callback function to the event name specified. `event` may be a space delimited string of event names to which callbacks are bound.

You can provide an optional `context` in which the callbacks will be run, as well.

**returns** ___this___

## `.off( [event, callback, context] )`

Unbinds callback functions. If an `event` is specified and no callbacks are specified, all callbacks bound to that event are unbound. If only `callback` is specified, then it is unbound from all events. If only `context` is specified, then all callbacks bound to any event with that context is unbound. Combinations of the three options limit what is unbound.

**returns** ___this___

## `.trigger( event[, args...] )`

Fires off an event. As with all uses of `pubsub` functions, `event` can be a space delimited string of event names. All subsequent arguments are passed along to the bound callback functions as arguments.

**returns** ___this___

## `.listenTo( publisher, event, callback )`

The Inversion-Of-Control version of `.on()`. Whereas `.on()` puts all event management responsibilities on the object providing the publishing functionality, `.listenTo()` handles the bindings on the subscriber. The subscriber can then `.listenTo()` any number of publishers; all bindings are with `this` as the context.

**returns** ___this___

## `.stopListening( [publisher, event, callback] )`

The Inversion-Of-Control version of `.off()`. Like `.listenTo`, `.stopListening()` handles the event subscriptions on the subscriber side. Calling `.stopListening()` with no arguments cancels all subscriber event subscriptions to any publisher.

**returns** ___this___
