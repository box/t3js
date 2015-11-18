v2.0.0 - November 18, 2015

* 2.0.0 (Jeff Tan)
* Add separate file header for testing package (Jeff Tan)
* Fixing spaces in build script (Jeff Tan)
* Return singleton service instance when getService is called on pre-registered services (Jeff Tan)
* Add mousemove to allowed event types (Jeff Tan)
* Update README.md (Jeff Tan)
* Remove service exports from T3 (Jeff Tan)
* Update Readme for 2.0.0 release and add auto-version updating (Jeff Tan)
* Add hasService() to context object (Jeff Tan)
* [Breaking] Add allowedServiceList to TestServiceProvider (Jeff Tan)
* Use jQuery instead of $ for dom event delegation (Jeff Tan)
* Add linting to test directory (Jeff Tan)
* Breaking: Initialize behaviors before module (Jeff Tan)
* Change getService() to throw error when requesting non-existent service. Add hasService() method. (Jeff Tan)
* Bind event handlers after init() is called (Jeff Tan)
* Throw error when duplicate behaviors are included (Jeff Tan)
* Revert "Check for circular dependencies only during instantiation of service" (Denis Rodin)
* Check for circular dependencies only during instantiation of service (Denis Rodin)
* Check for circular dependencies only during instantiation of service (Denis Rodin)
* Breaking: Use NativeDOM by default (fixes #76) (Nicholas C. Zakas)
* Build: Upgrade ESLint (fixes #90) (Nicholas C. Zakas)

v1.5.1 - August 10, 2015

* 1.5.1 (Nicholas C. Zakas)
* Fix: Ensure DOMEventDelegate is in T3 release (Nicholas C. Zakas)

v1.5.0 - August 5, 2015

* 1.5.0 (Nicholas C. Zakas)
* Update: Make Box.Application chainable (fixes #65) (Nicholas C. Zakas)
* New: Add Box.DOMEventDelegate (fixes #47, fixes #63) (Nicholas C. Zakas)
* Update email address for support (Nicholas C. Zakas)

v1.4.1 - June 24, 2015

* 1.4.1 (Jeff Tan)
* Ammended existing test to cover new fields (Jason Divock)
* Making errors a bit more reportable (Jason Divock)

v1.4.0 - June 11, 2015

* 1.4.0 (Jeff Tan)
* Add missing commonJS and AMD wrappers (Jeff Tan)

v1.3.0 - June 9, 2015

* 1.3.0 (Jeff Tan)
* Breaking out dom events into an abstraction layer, building different versions of t3 accordingly (Jason Divock)
* Add AMD support. Fixes #50 (Priyajeet Hora)
* Fix release script (Nicholas C. Zakas)

v1.2.0 - April 23, 2015

* 1.2.0 (Nicholas C. Zakas)
* Change karma to use mocha reporter (Jeff Tan)
* Fix embedded sourcemap URL (fixes #31) (Nicholas C. Zakas)
* Add wrapper to T3 for CommonJS (Jeff Tan)
* Remove event delegation on detached nodes (Jeff Tan)
* Update: Fire event when broadcast() is called (fixes #43) (Nicholas C. Zakas)
* Reverting dist changes (Priyajeet Hora)
* Prevent event-target.js duplicate handlers. Fixes #35. (Priyajeet Hora)
* Clean up duplicated assign code (fixes #29) (azu)
* Todo example fails to update completed items. Fixes #25 (Priyajeet Hora)
* Firefox innerText fixes as well as switching the select all checkbox logic to use the model data instead of view elements Fixes #21 (Priyajeet Hora)
* readme grammar (Matthew Hadley)
* Apply or remove completed class when select all is clicked. Fixes #18. (Priyajeet Hora)
* Adding missing doctype Fixes #14 (Priyajeet Hora)

v1.1.1 - April 14, 2015

* 1.1.1 (Nicholas C. Zakas)
* Update build script to publish to npm and update site (Nicholas C. Zakas)
* Add Travis configuration (Nicholas C. Zakas)
* Add sourcemap generation (Nicholas C. Zakas)
* Update README with badges and more info (Nicholas C. Zakas)
* Missing semicolon in application-stub.js Fixes #4 (Priyajeet Hora)
* Create t3-testing bundle (Jeff Tan)
* Updating Karam coverage dir and adding it to gitignore (Tarrence van As)
* Add ESLint to package.json (Jeff Tan)
* Add license and contribution guide (Nicholas C. Zakas)
* Rename t3 to t3js (Jeff Tan)
* Adding items to .npmignore. Fixes #60. (Priyajeet Hora)
* Adding items to .npmignore. Fixes #60. (Priyajeet Hora)
* Adding npmignore. Fixes #60 (Priyajeet Hora)

v1.1.0 - March 30, 2015

* 1.1.0 (Nicholas C. Zakas)
* Fix release task (Nicholas C. Zakas)
* Add changelog generation (Nicholas C. Zakas)
* Update README for open sourcing (Nicholas C. Zakas)
* Remove most jQuery references (Nicholas C. Zakas)
* Switch to ShellJS and create dist files (Nicholas C. Zakas)
* Add focusin and focusout events (Jeff Tan)

1.0.2 - February 20, 2015

* v1.0.2 (Jeff Tan)
* Detect circular service dependencies (fixes #51) (Nicholas C. Zakas)
