![nbd.js](http://i.imgur.com/qstw3.png) [![Build Status](https://travis-ci.org/behance/nbd.js.png?branch=master)](https://travis-ci.org/behance/nbd.js)
---

**No Big Deal, Just Saying**

**nbd.js** is not Yet Another MVC Framework in that it does not seek to be the
end-all of client-side MVC/MVVM/MVP/MVW/etc needs. You can use it as a
standalone MVC framework, or in conjunction with any other frameworks. Use as
much or as little of **nbd.js** as you like, because it is designed to provide
modular functionality.

The best way to use **nbd.js** is through an [AMD module loader][amd] like
[RequireJS][]. Since each file is a one-to-one mapping to a module, the
fastest way to use **nbd.js** inside your JavaScript project is to check it out as
a git submodule. From the root of your own project's git repository:

    git submodule add https://github.com/behance/nbd.js.git path/to/modules/nbd

Then `require()` the modules you want into your project, and you're ready to
go! 

If your project doesn't make use of a module loader, no big deal. A packaged
version is available at **build/nbd.js**, and the minified version at
**build/nbd.min.js**. Including it will make all the modules avaible under the
`nbd` global namespace.

[amd]: https://github.com/amdjs/amdjs-api/wiki/AMD
[requirejs]: http://requirejs.org/

### [`require()` All the Modules!](docs/index.md)

## Contribute
Wish JavaScript frameworks provided a feature or solved a problem more
elegantly? Open up an issue! We'd love to hear from you and adding features is
no big deal.

### Coding Standard
**nbd.js** uses softtabstop=2, unix line endings. All modules are written
expecting an ES5 conformant engine, in ES5 Strict Mode. Compatibility with
older browsers is expected to be provided by a polyfill like [es5-shim][shim].

In addition, all code is expected to pass [JSLint][] with the following rules,
with reasonable exceptions.

    {
      bitwise: true,
      browser: true,
      continue: true,
      debug: true,
      devel: true,
      eqeq: true,
      forin: true,
      nomen: true,
      plusplus: true,
      regexp: true,
      undef: true,
      white: true
    }

[shim]: https://github.com/kriskowal/es5-shim
[jslint]: http://www.jslint.com/lint.html

## Todos

1. Documentation of all the modules, especially utilities
2. Views require something to handle existant DOM structures, i.e. not
   templated by JS
3. Templates registry for sane templates handling, engine-agnostic
4. HTML5 Worker controllers
