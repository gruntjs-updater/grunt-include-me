/*
 * grunt-include-me
 * https://github.com/Darkylin/grunt-include-me
 *
 * Copyright (c) 2015 darkylin
 * Licensed under the GNU license.
 */

'use strict';

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
      path:{
          dev:'test/src',
          dist:'test/dist'
      },
    // Before generating any new files, remove any previously-created files.
    clean: {
      tests: ['tmp']
    },

    // Configuration to be run (and then tested).
    include_me: {
        dev:{
            files: [{
                expand: true,
                cwd: '<%= path.dev %>',
                dest: '<%= path.dist %>',
                src: [
                    '*.hbs'
                ]
            }]
        }

    }

  });

  // Actually load this plugin's task(s).
  grunt.loadTasks('tasks');


  // By default, lint and run all tests.
  grunt.registerTask('default', [ 'include_me']);

};
