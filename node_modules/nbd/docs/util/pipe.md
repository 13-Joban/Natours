# `require('nbd/util/pipe')`
* [()](#-filters-)

`pipe` is a utility function that allows the chaining together of multiple functions, much in the manner of the pipelines in a shell.

## `( filters... )`

`pipe` is used in order to produce a single function that will pass its own arguments to the first function in `filters`, take the result of that function, send it as the input to the next function in `filters`, and repeat the process until it finally returns the result of the last function in `filters`.

```javascript
require(['nbd/util/pipe'], function(pipe) {
  function a( str ) {
    return str + ' dolor';
  }

  function b( str ) {
    return str + ' sit amet';
  }

  function c( str ) {
    return 'lorem ' + str;
  }

  // pipe produces a single function
  var ipso = pipe( a, b, c );
  typeof ipso === 'function';

  // Runs piped functions, taking result of one and handing to the next
  // Logs: lorem ipsum dolor sit amet
  console.log( ipso( 'ipsum' ) );
});
```

`pipe` is especially useful to produce a complex filter from a series of simple ones. It is also very useful for creating templating functions.

```javascript
require(['nbd/util/pipe', 'jquery'], function(pipe, $) {
  function tmpl( data ) {
    return "<div id='"+data.id+"'>"+data.topic+" is "+data.value+"</div>";
  }

  // template is a function that will produce a jQuery wrapped DOM element
  var template = pipe( tmpl, $ );

  // As if calling $( tmpl( data ) );
  template({ id: 'hhgg', topic: 'Meaning of Life', value: 42 });
});
```

**returns** *Function* The resulting function that, when run, will return the output as returned by the last `filter` function.
