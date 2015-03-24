/**
 * @fileoverview Build file
 * @author nzakas
 */
/*global target, exec, echo, find, which, test, exit, mkdir*/

'use strict';

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

require('shelljs/make');

var util = require('util'),
	nodeCLI = require('shelljs-nodecli');

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

	// Directories
	JS_DIRS = getSourceDirectories(),
	SRC_FILES = ['lib/box.js', 'lib/event-target.js', 'lib/context.js', 'lib/application.js'],

	// Files
	JS_FILES = find(JS_DIRS).filter(fileType('js')).join(' '),
	TEST_FILES = find('tests/').filter(fileType('js')).join(' ');

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------

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
 * Creates a release version tag and pushes to origin.
 * @param {string} type The type of release to do (patch, minor, major)
 * @returns {void}
 */
function release(type) {
	target.test();

	target.dist();

	execOrExit('git add -A');
	execOrExit('git commit --amend --no-edit');

	execOrExit('npm version ' + type);

	// ...and publish
	execOrExit('git push origin master --tags');
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

target.docs = function() {
	echo('Generating documentation');
	exec(JSDOC + '-d jsdoc ' + JS_DIRS.join(' '));
	echo('Documentation has been output to /jsdoc');
};

target.dist = function() {
	var pkg = require('./package.json'),
		distFilename = DIST_DIR + pkg.name + '.js',
		minDistFilename = distFilename.replace(/\.js$/, '.min.js');

	if (test('-d', DIST_DIR)) {
		rm('-r', DIST_DIR + '*');
	} else {
		mkdir(DIST_DIR);
	}

	// concatenate files together
	cat(SRC_FILES).to(distFilename);

	// create minified version
	nodeExec('uglifyjs', distFilename, '-o', minDistFilename);

	// Add copyrights and version info
	var versionComment = '/*! ' + pkg.name + ' v ' + pkg.version + '*/\n',
		copyrightComment = cat('./config/copyright.txt');

	(copyrightComment + versionComment + cat(distFilename)).to(distFilename);
	(copyrightComment + versionComment + cat(minDistFilename)).to(minDistFilename);

	// ensure there's a newline at the end of each file
	(cat(distFilename) + '\n').to(distFilename);
	(cat(minDistFilename) + '\n').to(minDistFilename);

	// create filenames with version in them
	cp(distFilename, distFilename.replace('.js', '-' + pkg.version + '.js'));
	cp(minDistFilename, minDistFilename.replace('.min.js', '-' + pkg.version + '.min.js'));
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
