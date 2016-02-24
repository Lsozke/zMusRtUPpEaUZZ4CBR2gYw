'use strict';

const time_grunt = require('time-grunt');

module.exports = function (grunt) {
	time_grunt(grunt);

	grunt.initConfig({
		eslint: {
			options: {
				configFile: '.eslintrc'
			},
			target: [
				'**/*.js',
				'!**/node_modules/**',
				'!**/coverage/**'
			]
		},

		istanbul_check_coverage: {
			default: {
				options: {
					coverageFolder: 'coverage'
				}
			}
		},

		mocha_istanbul: {
			coverage: {
				src: [
					'test/**/*.js'
				],
				options: {
					coverage: true,
					reporter: 'spec',
					istanbulOptions: [
						'--include-all-sources',
						'-x', 'Gruntfile.js',
						'-x', 'worker.js',
						'-x', 'seed.js'
					]
				}
			}
		}
	});

	grunt.event.on('coverage', function (lconvFileContents, done) {
		done();
	});

	grunt.loadNpmTasks('grunt-eslint');
	grunt.loadNpmTasks('grunt-mocha-istanbul');

	grunt.registerTask('default', ['']);
	grunt.registerTask('coverage', ['mocha_istanbul:coverage']);
	grunt.registerTask('lint', ['eslint']);
};