module.exports = function( grunt ) {

	'use strict';

	grunt.initConfig({
		concat: {
			options: {
				//separator: ';'
			},
			dist: {
				src: ['src/box.js', 'src/event-target.js', 'src/context.js', 'src/application.js'],
				dest: 'dist/t3.js'
			}
		},
		connect: {
			server: {
				options: {
					port: 9001,
					base: '.'
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
		}
	});


	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-connect');
	grunt.loadNpmTasks('grunt-contrib-qunit');


	grunt.registerTask( 'default', [ 'concat' ] );
	grunt.registerTask( 'test', [ 'connect', 'qunit' ] );
};
