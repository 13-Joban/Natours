# `require('nbd/util/construct')`

The `construct` utility is a bit different from all other utility functions. Although it returns a function, the function is not meant to be invoked directly. Rather, it is meant to be `.apply()`ed with another function as the context, such that it will construct an instance of the context function, with the arguments supplied to `.apply()`.

```js
require(['nbd/util/construct'], function(construct) {

  function Human(water, carbon, ammonia, lime) { /* magic */ }

  var baby,
  args = [ 35, 20, 4, 1.5 ];

  // Doing this:
  baby = construct.apply(Human, args);

  // Is the same as doing this:
  baby = new Human( 35, 20, 4, 1.5 );
});
```
