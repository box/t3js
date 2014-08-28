/* global module */

/* eslint camelcase: 0 */

module.exports = function( grunt ) {

	'use strict';

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		distName: 'dist/t3-<%= pkg.version %>.js',
		concat: {
			dist: {
				src: ['src/box.js', 'src/event-target.js', 'src/context.js', 'src/application.js'],
				dest: '<%= distName %>',
				options: {
					stripBanners: true,
					banner: '/*! <%= pkg.name %> v<%= pkg.version %> */\n'
				}
			}
		},
		connect: {
			server: {
				options: {
					port: 9001
				}
			}
		},
		mocha_phantomjs: {
			all: {
				options: {
					urls: [
						'http://127.0.0.1:9001/test/application.html',
						'http://127.0.0.1:9001/test/context.html',
						'http://127.0.0.1:9001/test/event-target.html'
					]
				}
			}
		},
		eslint: {
			dist: [
				'<%= distName %>'
			],
			dev: [
				'src/**/*.js',
				'test/**/*.js',
				'Gruntfile.js'
			],
			options: {
				format: 'stylish'
			}
		},
		jsdoc : {
			dist : {
				src: ['src/**/*.js'],
				options: {
					destination: 'doc'
				}
			}
		}
	});


	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-connect');
	grunt.loadNpmTasks('grunt-eslint');
	grunt.loadNpmTasks('grunt-mocha-phantomjs');
	grunt.loadNpmTasks('grunt-jsdoc');


	grunt.registerTask('lint', ['eslint:dev']);
	grunt.registerTask('test', ['connect', 'mocha_phantomjs']);
	grunt.registerTask('default', ['eslint:dev', 'test']);
	grunt.registerTask('build', ['eslint:dev', 'test', 'concat', 'eslint:dist', 'jsdoc']);
};
