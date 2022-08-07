# `require('nbd/Model')`
  *extends* [nbd/Class](Class.md)
  *mixesin* [nbd/trait/pubsub](../trait/pubsub.md)

* [new Model()](#constructor-id-data-)
* [.data()](#data-)
* [.get()](#get-key-)
* [.set()](#set-key-value-)
* [.destroy()](#destroy-)

Events:
* *Name of any property of the model* : `(currentValue, previousValue)`

The data-wrapping class of **nbd.js**. It is meant to be instanciated with the data object you want to manage. The primary purpose of having the `Model` class manage a data object is to have a consistent interface by which the data is accessed and modified, and to provide change notification.

When a `Model` instance has its data members changed according to the [`nbd/util/diff`](../util/diff.md) module, it triggers an event with the same name as the key of the member that has changed, with the value as the argument to the event.
This change detection happens off the current callstack, so as not to put overhead on data manipulation itself.

```javascript
require(['nbd/Model'], function(Model) {
  var car = new Model({ rims: 'plain' });

  car.on('rims', function(is, was) {
    console.log("New "+is+" rims");
  });

  car.data().rims = "kickin'"; // logs: New kickin' rims
});
```

## `constructor( [id, ]data )`

The `Model` constructor expects the data to be managed. The data is internally stored as a reference to `data`, so modifying the original `data` object will change it in the `Model` instance.

In addition to the data, `Model` can also be created with an id for the common use case of a piece of data being tied to a server id. In that case, there exists a `.id()` method that returns the id it was initialized with. This id can be a number or a string. A numeric string will automatically be converted into a number.

**returns** *Model* A new instance of `Model`

## `.data()`

The accessor method for retrieving the entire data object.

It is one of the two interface accessor methods. Calling it will trigger an async diff check if data has changed. This is so that you can retrieve the object once, make manipulations to it, and then have the `Model` automatically detect all the changes.

**returns** *Object* The data object that the instance of `Model` is managing

## `.get( key )`

The accessor method for retrieving only one value from the data object.

It is the other accessor method. Calling it will *not* trigger an async diff check, since it is intended only to retrieve a value.

**returns** *anything* The value associated with the specified key

## `.set( key, value )`
## `.set( data )`

The setter function. It takes two forms, either the key-value pair as two arguments, or an object of keys and values.
Calling this method will trigger an async diff check.

**returns** ___this___

## `.destroy()`

The `Model` destructor is just a convenience function since in JavaScript, destructors are not automatically called when the object is actually destroyed. `Model`'s destructor simply unbinds all events that had been bound to that instance.

**returns** *nothing*
