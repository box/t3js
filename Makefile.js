/**
 * @fileoverview Build file
 * @author nzakas
 */
/*global config, target, exec, echo, find, which, test, exit, mkdir*/

'use strict';

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

require('shelljs/make');

var util = require('util'),
	path = require('path'),
	nodeCLI = require('shelljs-nodecli'),
	semver = require('semver'),
	dateformat = require('dateformat'),
	uglifyjs = require('uglify-js');

//------------------------------------------------------------------------------
// Data
//------------------------------------------------------------------------------

var NODE = 'node ',	// intentional extra space
	NODE_MODULES = './node_modules/',
	DIST_DIR = './dist/',

	// Utilities - intentional extra space at the end of each string
	JSDOC = NODE + NODE_MODULES + 'jsdoc/jsdoc.js ',

	// Since our npm package name is actually 't3js'
	DIST_NAME = 't3',
	DIST_JQUERY_NAME = DIST_NAME + '-jquery',
	DIST_NATIVE_NAME = DIST_NAME + '-native',

	// Directories
	JS_DIRS = getSourceDirectories(),

	// Files

	SRC_JQUERY_FILES = ['lib/wrap-start.partial', 'lib/box.js', 'lib/event-target.js', 'lib/dom-jquery.js', 'lib/dom-event-delegate.js', 'lib/context.js', 'lib/application.js', 'lib/wrap-end.partial'],
	SRC_NATIVE_FILES = ['lib/wrap-start.partial', 'lib/box.js', 'lib/event-target.js', 'lib/dom-native.js', 'lib/dom-event-delegate.js', 'lib/context.js', 'lib/application.js', 'lib/wrap-end.partial'],
	TESTING_JQUERY_FILES = ['lib/wrap-start.partial', 'lib/box.js', 'lib/event-target.js', 'lib/dom-jquery.js', 'lib/dom-event-delegate.js', 'lib/application-stub.js', 'lib/test-service-provider.js', 'lib/wrap-end.partial'],
	TESTING_NATIVE_FILES = ['lib/wrap-start.partial', 'lib/box.js', 'lib/event-target.js', 'lib/dom-native.js', 'lib/dom-event-delegate.js', 'lib/application-stub.js', 'lib/test-service-provider.js', 'lib/wrap-end.partial'],
	JS_FILES = find(JS_DIRS).filter(fileType('js')).join(' '),
	TEST_FILES = find('tests/').filter(fileType('js')).join(' ');

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------

/**
 * Checks if current repository has any uncommitted changes
 * @return {boolean}
 */
function isDirectoryClean() {
	var fatalState = config.fatal; // save current fatal state
	config.fatal = false;
	var isUnstagedChanges = exec('git diff --exit-code', {silent:true}).code;
	var isStagedChanged = exec('git diff --cached --exit-code', {silent:true}).code;
	config.fatal = fatalState; // restore fatal state
	return !(isUnstagedChanges || isStagedChanged);
}

/**
 * Executes a Node CLI and exits with a non-zero exit code if the
 * CLI execution returns a non-zero exit code. Otherwise, it does
 * not exit.
 * @param {...string} [args] Arguments to pass to the Node CLI utility.
 * @returns {void}
 * @private
 */
function nodeExec(args) {
	args = arguments; // make linting happy
	var code = nodeCLI.exec.apply(nodeCLI, args).code;
	if (code !== 0) {
		exit(code);
	}
}

/**
 * Runs exec() but exits if the exit code is non-zero.
 * @param {string} cmd The command to execute.
 * @returns {void}
 * @private
 */
function execOrExit(cmd) {
	var code = exec(cmd).code;
	if (code !== 0) {
		exit(code);
	}
}

/**
 * Generates a function that matches files with a particular extension.
 * @param {string} extension The file extension (i.e. 'js')
 * @returns {Function} The function to pass into a filter method.
 * @private
 */
function fileType(extension) {
	return function(filename) {
		return filename.substring(filename.lastIndexOf('.') + 1) === extension;
	};
}

/**
 * Determines which directories are present that might have JavaScript files.
 * @returns {string[]} An array of directories that exist.
 * @private
 */
function getSourceDirectories() {
	var dirs = [ 'lib', 'src', 'app' ],
		result = [];

	dirs.forEach(function(dir) {
		if (test('-d', dir)) {
			result.push(dir);
		}
	});

	return result;
}

/**
 * Gets the git tags that represent versions.
 * @returns {string[]} An array of tags in the git repo.
 * @private
 */
function getVersionTags() {
	var tags = exec('git tag', { silent: true }).output.trim().split(/\n/g);

	return tags.reduce(function(list, tag) {
		if (semver.valid(tag)) {
			list.push(tag);
		}
		return list;
	}, []).sort(semver.compare);
}

/**
 * Verifies that common module loaders can be used with dist files
 * @returns {void}
 * @private
 */
function validateModuleLoading() {
	var t3js = require(DIST_DIR + DIST_NAME + '.js');

	// Validate CommonJS
	if (!t3js || !('Application' in t3js)) {
		echo('ERROR: The dist file is not wrapped correctly for CommonJS');
		exit(1);
	}
}

/**
 * Updates the README links with the latest version
 * @param string version The latest version string
 * @returns {void}
 * @private
 */
function updateReadme(version) {
	// Copy to temp file
	cat('README.md').to('README.tmp');

	// Replace Version String
	sed('-i', /\/box\/t3js\/v([^/])+/g, '/box/t3js/' + version, 'README.tmp');

	// Replace README
	rm('README.md');
	mv('README.tmp', 'README.md');
}

/**
 * Creates a release version tag and pushes to origin.
 * @param {string} type The type of release to do (patch, minor, major)
 * @returns {void}
 */
function release(type) {

	// 'npm version' needs a clean repository to run
	if (!isDirectoryClean()) {
		echo('RELEASE ERROR: Working directory must be clean to push release!');
		exit(1);
	}

	echo('Running tests');
	target.test();

	// Step 1: Create the new version
	echo('Creating new version');
	var newVersion = exec('npm version ' + type).output.trim();

	// Step 2: Generate files
	echo('Generating dist files');
	target.dist();
	echo('Generating changelog');
	target.changelog();
	updateReadme(newVersion);

	// Step 3: Validate CommonJS wrapping
	echo('Validating module loading');
	validateModuleLoading();

	// Step 4: Add files to current commit
	execOrExit('git add -A');
	execOrExit('git commit --amend --no-edit');

	// Step 5: reset the git tag to the latest commit
	execOrExit('git tag -f ' + newVersion);

	// Step 6: publish to git
	echo('Pushing to github');
	execOrExit('git push origin master --tags');

	// Step 7: publish to npm
	echo('Publishing to NPM');
	execOrExit('npm publish');

	// Step 8: Update version number in docs site
	echo('Updating documentation site');
	execOrExit('git checkout gh-pages');
	('version: ' + newVersion).to('_data/t3.yml');
	execOrExit('git commit -am "Update version number to ' + newVersion + '"');
	execOrExit('git fetch origin && git rebase origin/gh-pages && git push origin gh-pages');

	// Step 9: Switch back to master
	execOrExit('git checkout master');

	// Step 10: Party time
}


//------------------------------------------------------------------------------
// Tasks
//------------------------------------------------------------------------------

target.all = function() {
	target.test();
};

target.lint = function() {
	echo('Validating JavaScript files');
	nodeExec('eslint', [JS_FILES, TEST_FILES].join(' '));
};

target.test = function() {
	target.lint();

	echo('Running browser tests');
	var code = exec('node ./node_modules/karma/bin/karma start config/karma-conf.js').code;
	if (code !== 0) {
		exit(code);
	}

	echo('Running Utilities tests');
	target['utils-test']();

	echo('Running API tests');
	target['api-test']();
};

target['utils-test'] = function() {
	var code = exec('node ./node_modules/karma/bin/karma start config/testing-utils-karma-conf.js').code;
	if (code !== 0) {
		exit(code);
	}
};

target['api-test'] = function() {
	// generate dist files that are used by api-test
	target.dist();

	nodeExec('mocha', './tests/api-test.js');

	// revert generated files
	execOrExit('git checkout dist');
};

target['test-watch'] = function() {
	echo('Watching files to run browser tests. Press Ctrl+C to exit.');
	var code = exec('node ./node_modules/karma/bin/karma start config/karma-conf.js --single-run=false --autoWatch').code;
	if (code !== 0) {
		exit(code);
	}
};

target.docs = function() {
	echo('Generating documentation');
	exec(JSDOC + '-d jsdoc ' + JS_DIRS.join(' '));
	echo('Documentation has been output to /jsdoc');
};

function generateDistFiles(dist) {
	var pkg = require('./package.json'),
		distFilename = DIST_DIR + dist.name + '.js',
		minDistFilename = distFilename.replace(/\.js$/, '.min.js'),
		minDistSourcemapFilename = minDistFilename + '.map',
		distTestingFilename = DIST_DIR + dist.name + '-testing' + '.js';

	// Add copyrights and version info
	var versionComment = '/*! ' + dist.name + ' v' + pkg.version + ' */\n',
		testingVersionComment = '/*! ' + dist.name + '-testing v' + pkg.version + ' */\n',
		copyrightComment = cat('./config/copyright.txt');

	// concatenate files together and add version/copyright notices
	(versionComment + copyrightComment + cat(dist.files)).to(distFilename);
	(testingVersionComment + copyrightComment + cat(dist.testingFiles)).to(distTestingFilename);

	// create minified version with source maps
	var result = uglifyjs.minify(distFilename, {
		output: {
			comments: /^!/
		},
		outSourceMap: path.basename(minDistSourcemapFilename)
	});
	result.code.to(minDistFilename);
	result.map.to(minDistSourcemapFilename);

	// create filenames with version in them
	cp(distFilename, distFilename.replace('.js', '-' + pkg.version + '.js'));
	cp(minDistFilename, minDistFilename.replace('.min.js', '-' + pkg.version + '.min.js'));
	cp(distTestingFilename, distTestingFilename.replace('.js', '-' + pkg.version + '.js'));
}

target.dist = function() {
	if (test('-d', DIST_DIR)) {
		rm('-r', DIST_DIR + '*');
	} else {
		mkdir(DIST_DIR);
	}

	[{
		name: DIST_NATIVE_NAME,
		files: SRC_NATIVE_FILES,
		testingFiles: TESTING_NATIVE_FILES
	}, {
		name: DIST_JQUERY_NAME,
		files: SRC_JQUERY_FILES,
		testingFiles: TESTING_JQUERY_FILES
	}, {
		name: DIST_NAME,
		files: SRC_NATIVE_FILES,
		testingFiles: TESTING_NATIVE_FILES
	}].forEach(function(dist){
		generateDistFiles(dist);
	});
};

target.changelog = function() {

	// get most recent two tags
	var tags = getVersionTags(),
		rangeTags = tags.slice(tags.length - 2),
		now = new Date(),
		timestamp = dateformat(now, 'mmmm d, yyyy');

	// output header
	(rangeTags[1] + ' - ' + timestamp + '\n').to('CHANGELOG.tmp');

	// get log statements
	var logs = exec('git log --pretty=format:"* %s (%an)" ' + rangeTags.join('..'), {silent: true}).output.split(/\n/g);
	logs = logs.filter(function(line) {
		return line.indexOf('Merge pull request') === -1 && line.indexOf('Merge branch') === -1;
	});
	logs.push(''); // to create empty lines
	logs.unshift('');

	// output log statements
	logs.join('\n').toEnd('CHANGELOG.tmp');

	// switch-o change-o
	cat('CHANGELOG.tmp', 'CHANGELOG.md').to('CHANGELOG.md.tmp');
	rm('CHANGELOG.tmp');
	rm('CHANGELOG.md');
	mv('CHANGELOG.md.tmp', 'CHANGELOG.md');
};

target.patch = function() {
	release('patch');
};

target.minor = function() {
	release('minor');
};

target.major = function() {
	release('major');
};
