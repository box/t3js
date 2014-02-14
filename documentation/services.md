---
layout: documentation
title: T3 Javascript Framework - API - Services
permalink: /documentation/services/
---

Services
========
Services provide new capabilities to the Application or modules.
Services are able to be swapped in and out so long as they adhere to certain interfaces.
This is how the Application is able to extend and change over time.
Services may interact with the Application and other services.

General Rules
-------------
1. Services should avoid initialization logic.
1. Services should not reach into modules that it did not create itself.
1. Do not expose helper or testing functions on the public API.
1. Service names should be lower-case, with no underscores or dashes. (e.g. windowpopup)

