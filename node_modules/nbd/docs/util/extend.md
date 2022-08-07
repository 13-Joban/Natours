# `require('nbd/util/extend')`
* [()](#-target-sources-)

The `extend` module is a utility function that merges source objects into the target object.

## `( target, sources... )`

`extend()` implementation is the same as that in Underscore's [`_.extend()`][1]. The only difference is that instead of using `Array.each` to loop through the source objects, `extend()` uses a simple `for` loop.

For every source object, the object's properties, including all prototype-inherited properties, are copied onto the target.

```javascript
require(['nbd/util/extend'], function(extend) {
  function Foo() {}
  Foo.prototype.foo = 'bar';

  var x = new Foo();
  x.marco = 'polo';

  var n = {};
  // Copies all properties of x onto n
  extend(n, x);

  // Both true
  n.marco === 'polo';
  n.foo === 'bar';
});
```

**returns** *Object* The target object, after all properties have been copied.

[1]: http://underscorejs.org/docs/underscore.html#section-74
