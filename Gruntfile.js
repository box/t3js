module.exports = function( grunt ) {

	'use strict';

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		concat: {
			dist: {
				src: ['src/box.js', 'src/event-target.js', 'src/context.js', 'src/application.js'],
				dest: 'dist/t3-<%= pkg.version %>.js'
			}
		},
		connect: {
			server: {
				options: {
					port: 9001
				}
			}
		},
		qunit: {
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
		jshint: {
			src: {
				src: ['src/**/*.js'],
				options: {
					jshintrc: 'src/.jshintrc'
				}
			},
			test: {
				src: ['test/**/*.js'],
				options: {
					jshintrc: 'test/.jshintrc'
				}
			},
			grunt: {
				src: ['Gruntfile.js'],
				jshintrc: '.jshintrc'
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
	grunt.loadNpmTasks('grunt-contrib-qunit');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-jsdoc');


	grunt.registerTask('test', ['connect', 'qunit']);
	grunt.registerTask('default', ['jshint', 'test', 'concat', 'jsdoc']);
};
