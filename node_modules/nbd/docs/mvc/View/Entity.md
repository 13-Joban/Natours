# `require('nbd/View/Entity')`
  *extends* [nbd/View](../View.md)
  *mixesin* [nbd/trait/pubsub](../../trait/pubsub.md)

* [new Entity()](#constructor-model-)
* [.id()](#id-)
* [.templateData()](#templatedata-)
* [.render()](#render-parent-)

Events:
* __prerender__
* __postrender__ : `(this.$view)`

The `Entity` subclass is a specific View class, intended to be used with a `Model` instance. Primarily it is used to manage the DOM elements that represent a model.

## `constructor( model )`

The constructor for an `Entity` View expects a `model`, whether that is an instance of `nbd/Model` or not. If that `model` is an **Object**, it will be attached to the instance as `this._model`.

For backwards compatibility, `this.Model` is also available and contains the same reference as `this._model`.

**returns** *Entity* A new instance of `Entity`

## `.id()`

If `this._model` has a declared `.id` property, then the `Entity` instance's `.id` property will be that. Otherwise, `.id()` will return the `model` that was handed to the constructor.

**returns** The return value from `this._model.id()` or `model`

## `.templateData()`

`Entity` overrides `View`'s `.templateData()` to provide a sensible default for templating. If the instance uses an `nbd/Model`, then it returns `this._model.data()`. Otherwise, it returns `this.id()`

This is so that by default, without further overriding `.templateData()`, any calls to `.render()` will provide the `.template()` function with the most useful data it can.

**returns** *Object* or *anything*

## `.render( [$parent] )`

The render function in `Entity` completely overrides `View.render()`. The rendering behavior depends on whether or not the `Entity` has already been rendered (i.e. `this.$view` exists), and whether or not `.render()` was called with a parent element.

If a parent element was provided, then `.render()` will render (append) the contents as a child element of the parent. If the view has never been rendered before, it will be rendered then (`.template()` will be called). Otherwise, the existing element will simply be re-appended to the parent element.

If `.render()` was called without a parent element, then it will only replace the existing element with a newly rendered element. Nothing happens if the view has never been rendered before.

In all cases, only when a new view renders will the **prerender** and **postrender** events fire.
