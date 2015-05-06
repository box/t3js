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
	BUILD_DIR = './build/',
	DIST_DIR = './dist/',
	LIB_DIR = './lib/',

	// Utilities - intentional extra space at the end of each string
	ISTANBUL = NODE + NODE_MODULES + 'istanbul/lib/cli.js ',
	MOCHA = NODE_MODULES + 'mocha/bin/_mocha ',
	JSDOC = NODE + NODE_MODULES + 'jsdoc/jsdoc.js ',

	// Since our npm package name is actually 't3js'
	DIST_NAME = 't3',
	DIST_JQUERY_NAME = DIST_NAME + '-jquery',
	DIST_NATIVE_NAME = DIST_NAME + '-native',
	DIST_TESTING_BUNDLE_NAME_JQUERY = DIST_JQUERY_NAME + '-testing',
	DIST_TESTING_BUNDLE_NAME_NATIVE = DIST_NATIVE_NAME + '-testing',

	// Directories
	JS_DIRS = getSourceDirectories(),

	// Files
	SRC_JQUERY_FILES = ['lib/box.js', 'lib/event-target.js', 'lib/dom-jquery.js', 'lib/context.js', 'lib/application.js'],
	SRC_NATIVE_FILES = ['lib/box.js', 'lib/event-target.js', 'lib/dom-native.js', 'lib/context.js', 'lib/application.js'],
	TESTING_JQUERY_FILES = ['lib/box.js', 'lib/event-target.js', 'lib/dom-jquery.js', 'lib/application-stub.js', 'lib/test-service-provider.js'],
	TESTING_NATIVE_FILES = ['lib/box.js', 'lib/event-target.js', 'lib/dom-native.js', 'lib/application-stub.js', 'lib/test-service-provider.js'],
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
	var tags = exec("git tag", { silent: true }).output.trim().split(/\n/g);

	return tags.reduce(function(list, tag) {
		if (semver.valid(tag)) {
			list.push(tag);
		}
		return list;
	}, []).sort(semver.compare);
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

	target.test();

	// Step 1: Create the new version
	var newVersion = exec("npm version " + type).output.trim();

	// Step 2: Generate files
	target.dist();
	target.changelog();

	// Step 3: Add files to current commit
	execOrExit('git add -A');
	execOrExit('git commit --amend --no-edit');

	// Step 4: reset the git tag to the latest commit
	execOrExit('git tag -f ' + newVersion);

	// Step 5: publish to git
	execOrExit('git push origin master --tags');

	// Step 6: publish to npm
	execOrExit('npm publish');

	// Step 7: Update version number in docs site
	execOrExit('git checkout gh-pages');
	('version: ' + newVersion).to('_data/t3.yml');
	execOrExit('git commit -am "Update version number to ' + newVersion + '"');
	execOrExit('git fetch origin && git rebase origin/gh-pages && git push origin gh-pages');

	// Step 8: Switch back to master
	execOrExit('git checkout master');

	// Step 9: Party time
}


//------------------------------------------------------------------------------
// Tasks
//------------------------------------------------------------------------------

target.all = function() {
	target.test();
};

target.lint = function() {
	echo('Validating JavaScript files');
	nodeExec('eslint', JS_FILES);
};

target.test = function() {
	target.lint();

	echo('Running browser tests');
	var code = exec('node ./node_modules/karma/bin/karma start config/karma-conf.js').code;
	if (code !== 0) {
		exit(code);
	}
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


function generateDistFiles(dist){
	var pkg = require('./package.json'),
		distFilename = DIST_DIR + dist.name + '.js',
		minDistFilename = distFilename.replace(/\.js$/, '.min.js'),
		minDistSourcemapFilename = minDistFilename + '.map',
		distTestingFilename = DIST_DIR + dist.name + '-testing' + '.js';

	// Add copyrights and version info
	var versionComment = '/*! ' + dist.name + ' v ' + pkg.version + '*/\n',
		copyrightComment = cat('./config/copyright.txt');

	// concatenate files together and add version/copyright notices
	(versionComment + copyrightComment + cat(dist.files)).to(distFilename);
	(versionComment + copyrightComment + cat(dist.testingFiles)).to(distTestingFilename);

	// create minified version with source maps
	var result = uglifyjs.minify(distFilename, {
		output: {
			comments: /^!/
		},
		outSourceMap: path.basename(minDistSourcemapFilename)
	});
	result.code.to(minDistFilename);
	result.map.to(minDistSourcemapFilename);

	// ensure there's a newline at the end of each file
	(cat(distFilename) + '\n').to(distFilename);
	(cat(minDistFilename) + '\n').to(minDistFilename);
	(cat(distTestingFilename) + '\n').to(distTestingFilename);

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
        files: SRC_JQUERY_FILES,
        testingFiles: TESTING_JQUERY_FILES
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
