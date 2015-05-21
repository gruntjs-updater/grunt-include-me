/*
 * grunt-include-me
 * https://github.com/Darkylin/grunt-include-me
 *
 * Copyright (c) 2015 darkylin
 * Licensed under the GNU license.
 */

'use strict';

module.exports = function (grunt) {

    // Please see the Grunt documentation for more information regarding task
    // creation: http://gruntjs.com/creating-tasks

    grunt.registerMultiTask('include_me', 'grunt plugin to make including file easier', function () {
        // Merge task-specific and/or target-specific options with these defaults.
        var options = this.options({});

        this.files.forEach(function (f) {
            console.dir(f);
        });
    });

};
