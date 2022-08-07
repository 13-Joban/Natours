# `require('nbd/util/diff')`
* [()](#-a-b-callback-)

`diff` is a utility function that finds the differences between two objects and reports the differences as an object of arrays.

## `( a, b[, callback] )`
**callback( key, a[key], b[key] )**

JavaScript's Object is a simple yet powerful data structure. `diff()` is a utility method for finding the differences in two objects, given that objects are essentially key-value stores. Calling `diff()` on any two objects will find the keys in the two objects that correspond to strictly different values.  This means that according to `diff()`, `{fingers:10}` and `{fingers:"10"}` are two different objects.

In addition to a strict comparison, if the objects for comparison themselves contain objects, `diff()` will recurse into them to find out if the contained objects are different. `diff()` then returns an object whose keys are the keys that are different between the two objects, and whose values are arrays containing each object's corresponding value.

```javascript
require(['nbd/util/diff'], function(diff) {
  var a = {
    foo : 'bar',
    first : true
  },
  b = {
    foo : 'bar',
    first : false
  };

  diff( a, b ); // returns { first: [true, false] }
});
```

`diff()` also allows specifying a callback function, which will be called for each different key, with the key name and corresponding values as arguments.

```javascript
require(['nbd/util/diff'], function(diff) {
  var a = {
    foo : 'bar',
    first : true
  },
  b = {
    foo : 'bar',
    first : false
  };

  diff( a, b, console.log ); // logs: "first", true, false
});
```

**returns** *Object* An object of the different keys, with object values as an array of their values.
