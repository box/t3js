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
		}
	});

	grunt.loadNpmTasks('grunt-beep');
	grunt.loadNpmTasks('grunt-contrib-concat');

	//grunt.loadTasks( 'build/tasks' );

	// Short list as a high frequency watch task
	//grunt.registerTask( 'dev', [ 'build:*:*', 'jshint' ] );

	// Default grunt
	grunt.registerTask( 'default', [ 'concat', 'beep' ] );
};
