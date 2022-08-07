# `require('nbd/util/media')`
  *mixesin* [nbd/trait/pubsub](../trait/pubsub.md)

* [()](#-breakpoint-query-)
* [.is()](#is-breakpoint-)
* [.getState()](#getstate-breakpoint-)

Events:
* *Name of any breakpoint* : `(isActive)`
* *Name of any breakpoint*__:enter__
* *Name of any breakpoint*__:exit__

`media` is a module that makes working with HTML5 [Media Queries][1] easy. It allows you to create breakpoints from media queries, and will trigger events whenever those breakpoints are hit.

[1]: https://developer.mozilla.org/en-US/docs/DOM/Using_media_queries_from_code

## `( breakpoint, query )`
## `( breakpoints )`

Adds a breakpoint definition to the `media` module. A breakpoint definition is a breakpoint with an associated media query. The `media` module uses matchMedia for evaluating media queries in JavaScript. If no matchMedia support is present, calling `media()` will throw the error "Media queries not supported."

Multiple breakpoints can be specified at the same time by giving `media()` an object with the breakpoint names as keys and their media queries as values.

```javascript
media({small:'all and (max-width:600px)', medium:'all and (max-width:1280px)'})
```

`media` uses `nbd/trait/pubsub` to publish whenever a breakpoint is entered or exited. The event it fires is the name of the breakpoint with a boolean argument of the state of the breakpoint. In addition, there is a ":enter" and ":exit" event for every breakpoint.

```javascript
require(['nbd/util/media'], function(media) {
  media('phone', 'all and (max-width: 800px)')
  .on('phone', function(active) {
    console.log("Phone mode is "+active);
  })
  .on('phone:enter', function() {
    console.log("Entered phone mode");
  })
  .on('phone:exit', function() {
    console.log("Exited phone mode");
  });
});
```

Beware that the `media` module evaluates the media queries once, immediately after registering. If event bindings were not bound until after `media` runs, they will not fire for the currently active breakpoint. All subsequent changes will trigger normally.

**returns** *itself*

## `.is( breakpoint )`

For checking whether or not `breakpoint` is currently active as defined by its associated media query.

**returns** *Boolean* Whether or not the `breaktpoint` is currently active

## `.getState( [breakpoint] )`

Gets the currently matching breakpoints in an array. If provided a specific breakpoint, behaves exactly as `.is( breakpoint )`.

**returns** *Array* All currently active breakpoints
