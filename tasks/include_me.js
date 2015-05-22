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
        var options = this.options({
            directive:'@include'
        });
        // Merge task-specific and/or target-specific options with these defaults.
        var gruntDone = this.async();

        var fs = require('fs'),
            split=require('split'),
            through = require('through2'),
            path = require('path');

        var fileCount = 0;
        var INCLUDE_REP=new RegExp('^\\s*'+options.directive+'\\s*([\\w/]+)\\s*$');
        var cache = {};
        this.files.forEach(function (f) {
            f.src.forEach(function(src){
                fileCount++;
                fs.createReadStream(src).pipe(split()).pipe(through(function(buffer,encoding,next){
                    var line = buffer.toString(),
                        includeFile=line.match(INCLUDE_REP);
                    if(includeFile!==null){
                        var fileName = includeFile[1];
                        path.dirname(src)
                        this.push(null);
                    }else{
                        this.push(buffer);
                    }
                    next();
                },function(done){
                    done();
                    fileCount--;
                    if(fileCount==0){
                        gruntDone();
                    }
                }));
            })
        });
    });

};
