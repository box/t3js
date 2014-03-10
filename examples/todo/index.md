---
layout: examples
title: T3 JavaScript Framework - Todo.js Example
permalink: /examples/todo/
todolink: /examples/todo/
sourcecode: https://gitenterprise.inside-box.net/Box/T3/tree/gh-pages/examples/todo/live
---

<div class="anchor" id="Overview"></div>
# Todo List
An app built for [TodoMVC](http://todomvc.com/)

<div class="anchor" id="demo"></div>
# Demo

<iframe src="{{ site.baseurl }}/examples/todo/live/" width="700" height="500"></iframe>
<a href="{{ site.baseurl }}/examples/todo/live/" target="_blank">Open in New Window</a>

<div class="anchor" id="sourcecode"></div>
# Source Code

<a href="{{ page.sourcecode }}" target="_blank">View in GitHub</a>

<div class="anchor" id="explanation"></div>
# Explanation of Code

The code was written for an HTML5 compliant browser.

The todo list app is split into 3 major modules:

1. The `header` module which lets users input new todo items
1. The `list` module which renders and displays complete/incomplete tasks
1. The `footer` module that allows users to filter or clear tasks

A `todo` behavior is used in the `list` module to handle events of each individual todo task. This simplifies the
overall responsibilities of the module to rendering todos and marking them all as incomplete/complete.

While all modules are independent, each module talks to a service that maintains todo status. The `todos-db` service
manages adding, removing, and marking tasks throughout the apps lifecycle. We could easily extend this
service to store todos via another service to the server or in HTML5 local storage.

The `router` service uses HTML5 history to change urls dynamically and fire application messages.
The `statechanged` message that is broadcast upon navigation is used by modules to update content.

Several messages are used between modules:

1. `todoadded` - Fired when a todo is added to the list
1. `todoremoved` - Fired when a todo is removed from the list
1. `todostatuschanged` - Fired when a todo changes from complete->incomplete and vice versa

Overall, message names should be understandable without explanation.