/* global window, mochaPhantomJS */

mocha.checkLeaks();
mocha.globals(['jQuery']);
if (window.mochaPhantomJS) {
	mochaPhantomJS.run();
} else {
	mocha.run();
}
