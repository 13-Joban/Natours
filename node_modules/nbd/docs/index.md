# Modules

1. [MVC modules](#mvc-modules)
2. [Traits](#traits)
3. [Utilities](#utilities)

## MVC modules

All MVC modules are Class constructors. I.e. they return functions that are intended to be instanciated with `new`.

* [nbd/Class](mvc/Class.md)
* [nbd/Model](mvc/Model.md)
* [nbd/View](mvc/View.md)
  * [nbd/View/Entity](mvc/View/Entity.md)
  * nbd/View/Element
* nbd/Controller
  * nbd/Controller/Entity

## Traits

Traits are simply objects meant to be `extend()`ed into existing objects or `.mixin()`ed into Classes.

* [nbd/trait/promise](trait/promise.md)
* [nbd/trait/pubsub](trait/pubsub.md)

## Utilities

Utilities are usually functions meant to be run by themselves. However some utility functions have extra functionality attached.

* [nbd/util/async](util/async.md)
* [nbd/util/construct](util/construct.md)
* nbd/util/deparam
* [nbd/util/diff](util/diff.md)
* [nbd/util/extend](util/extend.md)
* [nbd/util/media](util/media.md)
* [nbd/util/pipe](util/pipe.md)
* nbd/util/protochain
