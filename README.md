[![NPM version][npm-image]][npm-url]
[![Build Status][travis-image]][travis-url]
[![Project Status](http://opensource.box.com/badges/stable.svg)](http://opensource.box.com/badges)

# T3 JavaScript Framework

T3 is a client-side JavaScript framework for building large-scale web applications. Its design is based on the principles of [Scalable JavaScript Application Architecture](https://www.youtube.com/watch?v=mKouqShWI4o), specifically:

* Enforcing loose coupling between components
* Making dependencies explicit
* Providing extension points to allow for unforeseen requirements
* Abstracting away common pain points
* Encouraging progressive enhancement

The approaches taken in T3 have been battle-hardened through continuous production use at [Box](https://box.com) since 2013, where we use T3 along with jQuery, jQuery UI, and several other third-party libraries and frameworks.

## Framework Design

T3 is different from most JavaScript frameworks. It's meant to be a small piece of an overall architecture that allows you to build scalable client-side code.

### No MVC Here

T3 is explicitly *not* an MVC framework. It's a framework that allows the creation of loosely-coupled components while letting you decide what other pieces you need for your web application. You can use T3 with other frameworks like [Backbone](http://backbonejs.org/) or [React](http://facebook.github.io/react/), or you can use T3 by itself. If you decide you want model and views, in whatever form, you can still use them with T3.

### Unopinionated by Design

T3 is made to be unopinionated while prescribing how some problems might be solved.  Our goal here is not to create a single framework that can do everything for you, but rather, to provide some structure to your client-side code that allows you to make good choices. Then, you can add in other libraries and frameworks to suit your needs.

### Three Component Types

T3 allows you to define functionality using just three component types:

1. **Services** are utility libraries that provide additional capabilities to your application. You can think of services as tools in a toolbox that you use to build an application. They intended to be reusable pieces of code such as cookie parsing, Ajax communication, string utilities, and so on.
2. **Modules** represent a particular DOM element on a page and manage the interaction inside of that element. It's a module's job to respond to user interaction within its boundaries. Your application is made up of a series of modules. Modules may not interact directly with other modules, but may do so indirectly.
3. **Behaviors** are mixins for modules and are used primarily to allow shared declarative event handling for modules without duplicating code. If, for instance, you use a particular attribute to indicate a link should use Ajax navigation instead of full-page navigation, you can share that functionality amongst multiple modules.

We've found that by using a combination of these three component types, we're able to create compelling, progressively-enhanced user experiences.

## Installation

**Dependency:** T3 requires jQuery v1.8.0 or higher.

To include T3 in a web page, you can use [RawGit](http://rawgit.com).

The last published release:

```
<!-- Recommended: Use a specific version of T3 -->
<script src="https://cdn.rawgit.com/box/t3js/v1.1.0/dist/t3.js"></script>

<!-- Recommended: Use a specific minified version of T3 -->
<script src="https://cdn.rawgit.com/box/t3js/v1.1.0/dist/t3.min.js"></script>

<!-- Dev-only: latest published release -->
<script src="https://cdn.rawgit.com/box/t3js/master/dist/t3.js"></script>

<!-- Dev-only: latest published release minified -->
<script src="https://cdn.rawgit.com/box/t3js/master/dist/t3.min.js"></script>
```

**Note:** We highly recommend using a specific version of T3. Linking directly to the master branch means getting updates without notice.

## Getting Started

Your T3 front-end is made up of modules, so the first step is to indicate which modules are responsible for which parts of the page. You can do that by using the `data-module` attribute and specifying the module ID, such as:

```html
<div data-module="header">
    <h1>Box</h1>
    <button id="welcome">Show Welcome</button>
</div>
```

This example specifies the module `header` should manage this particular part of the page. The module `header` is then defined as:

```js
Box.Application.addModule('header', function(context) {

    return {

        onclick: function(event) {
            if (event.target.id === 'welcome') {
                alert('Welcome, T3 user!');
            } else {
                alert('You clicked outside the button.');
            }
        }

    };

});
```

This is a very simple module that has an `onclick` handler. T3 automatically wires up specified event handlers so you don't have to worry about using event delegation or removing event handlers when they are no longer needed. The `onclick` handler receives a DOM-normalized event object that can be used to get event details. When the button is clicked, a message is displayed. Additionally, clicking anywhere inside the module will display a different message. Event handlers are tied to the entire module area, so there's no need to attach multiple handlers of the same type.

The last step is to initialize the T3 application:

```js
Box.Application.init();
```

This call starts all modules on the page (be sure to include both the T3 library and your module code before calling `init()`).  We recommend calling `init()` as soon as possible after your JavaScript is loaded. Whether you do that `onload`, earlier, or later, is completely up to you.

There are more extensive tutorials and examples on our [website](http://t3js.org).

## Browser Support

T3 is tested and known to work in the following browsers:

* Internet Explorer 8 and higher
* Firefox (latest version)
* Chrome (latest version)
* Safari (latest version)

With the exception of Internet Explorer, T3 will continue to support the current and previous one version of all major browsers.

## Contributing

The main purpose of sharing T3 is to continue its development, making it faster, more efficient, and easier to use.

### Directory Structure

* `config` - configuration files for the project
* `dist` - browser bundles (this directory is updated automatically with each release)
* `lib` - the source code as individual files
* `tests` - the test code

### Prerequisites

In order to get started contributing to T3, you'll need to be familiar and have installed:

1. [Git](http://git-scm.com/)
1. [npm](https://npmjs.org)
1. [Node.js](https://nodejs.org) or [IO.js](https://iojs.org)

### Setup

Following the instructions in the [contributor guidelines](CONTRIBUTING.md) to setup a local copy of the T3 repository.

Once you clone the T3 git repository, run the following inside the `t3js` directory:

```
$ npm i
```

This sets up all the dependencies that the T3 build system needs to function.

**Note:** You'll need to do this periodically when pulling the latest code from our repository as dependencies might change. If you find unexpected errors, be sure to run `npm i` again to ensure your dependencies are up-to-date.

### Running Tests

After that, you can run all tests by running:

```
$ npm test
```

This will start by linting the code and then running all unit tests.

### Build Commands

The following build commands are available:

1. `npm test` - runs all linting and uni tests
1. `npm run lint` - runs all linting
1. `npm run dist` - creates the browser bundles and places them in `/dist`

## Frequently Asked Questions

### Why is there a dependency on jQuery?

jQuery is used primarily for its browser-normalizing event handling so we can support IE8. We investigated creating our own event handling library, but ultimately decided it wasn't worth the time because we were using jQuery already. When we drop support for IE8, we'll be able to remove the dependence on jQuery and use the native browser event handling.

### Why support IE8?

The Box web application currently supports IE8 with a [planned end-of-life of December 31, 2015](https://support.box.com/hc/en-us/articles/200519838-What-Is-the-Box-Policy-for-Browser-and-OS-Support-). As such, T3 must continue to support IE8 until Box has officially end-of-lifed it.

## Support

Need to contact us directly? Email oss@box.com and be sure to include the name of this project in the subject.

## Copyright and License

Copyright 2015 Box, Inc. All rights reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

[npm-image]: https://img.shields.io/npm/v/t3js.svg?style=flat-square
[npm-url]: https://npmjs.org/package/t3js
[travis-image]: https://img.shields.io/travis/box/t3js/master.svg?style=flat-square
[travis-url]: https://travis-ci.org/box/t3js
