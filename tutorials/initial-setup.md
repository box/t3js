---
layout: tutorial
title: T3 JavaScript Framework - Tutorials
permalink: /tutorials/initial-setup/
prev: overview
prev_title: 'Overview'
next: architecture
next_title: Architecture
---

# Initial Setup

You're going to need a few things in order to complete this tutorial:

- Your favorite text editor
- The starter kit

Download the starter kit <a href="{{ site.baseurl }}/starter-kit.zip">here</a>.


## Application Directory Structure

Take a look at the directory structure, it currently looks like this:

```
├── css
├── img
│   ├── full
│   └── thumbs
└── js
    ├── behaviors
    ├── modules
    ├── services
    ├── vendor
    │   ├── box
    │   │   └──t3.x.x.js
    │   └── jquery
    │       └──jquery.x.x.js
```

It's a best practice in T3 to have separate directories for modules, services, and behaviors.
