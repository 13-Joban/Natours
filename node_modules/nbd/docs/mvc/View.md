# `require('nbd/View')`
  *extends* [nbd/Class](Class.md)
  *mixesin* [nbd/trait/pubsub](../trait/pubsub.md)

* [new View()](#constructor-)
* [.render()](#render-data-)
* [.destroy()](#destroy-)

Events:
* __prerender__
* __postrender__ : `(this.$view)`

This is the highest-level generic View class, meant for managing a DOM node with the help of a jQuery-compatible library. Obviously, jQuery is the biggest intended audience, but `View` only depends on the API of the object being consistent, so you can use a compatible library like Zepto.

## `constructor()`

By default, `View` has an empty constructor. Subclasses can extend `View` and provide their own implementation of what the View should do.

**returns** *View* A new instance of `View`

## `.render( [data] )`

The default `View` rendering function calls `.template()` with the results of calling `.templateData()`. The results of running the templating function is stored as `this.$view`. You can then rely on `.render()` to populate `this.$view`.

You may also override the objected handed to `.template()` by calling `.render()` with `data`.

If there was an existing object at `this.$view`, it is replaced with the new `this.$view`.

In addition, there are also two render events fired. **prerender** is fired before the call to `.template()` and **postrender** is fired afterward. In addition to the events, if there is a `.rendered()` function, it will be called with `this.$view`.

**returns** *nothing*

## `.template()`

The templating function. This function by default is a stub. Subclasses should override it with a function that returns the jQuery-compatible object to be assigned to `this.$view`. Essentially, this function serves as the point of transformation from the results of `.templateData()` into the DOM elements to be available as `this.$view`.

If you have a templating function that simply returns HTML as a string, you can wrap it in the jQuery constructor function to get a jQuery wrapped object containing the parsed DOM.

```js
define(['jquery', 'nbd/util/pipe', 'nbd/View'], function($, pipe, View) {
  
  function templater(data) {
    return '<div><a href="'+data.url+'">'+data.label+'</a></div>';
  }

  return View.extend({
    template: pipe(templater, $)
  });
});
```

**returns** *jQuery* The intended content of `this.$view`

## `.templateData()`

Overridable method that returns an object to be given to to the `.template()` function for templating.

**returns** *Object* The data with which to hand to `.template()`

## `.destroy()`

The destructor function removes `this.$view` object if it's been rendered. It also unbinds any bindings to the rendering events.

**returns** *nothing*
