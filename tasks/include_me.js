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

    var mine = global._include_me = global._include_me || {pathspace: {__total: 0}};
    var pathspace = mine.pathspace;
    // return the given path's id, if path dosen't have id, assign a id to this path;
    // id goes from 1, increase by 1.
    function getId(path) {
        var id = pathspace[path];
        if (id === undefined) {
            id = pathspace[path] = ++pathspace.__total;
        }
        return id;
    }

    //TODO expand charset&encoding
    grunt.registerMultiTask('include_me', 'grunt plugin to make including file easier', function () {
        var options = this.options({
            directive: '@include',
            watch: false
        });
        var gruntDone = this.async();

        var fs = require('fs'),
            split = require('split'),
            through = require('through2'),
            path = require('path'),
            fse = require('fs-extra');

        var fileCount = 0;
        var INCLUDE_REP = new RegExp('^\\s*' + options.directive + '\\s*([\\w/.]+)\\s*$');
        var temp = {};
        this.files.forEach(function (f) {
            f.src.forEach(function (src) {
                var dest = f.dest;
                fileCount++;
                var stream = includeFile(src);

                // make sure the destination file is created already
                fse.ensureFile(dest, function () {
                    var writeStream = fs.createWriteStream(dest);
                    stream.pipe(writeStream);
                    if (!options.watch) {
                        //after all writestream finish, notify grunt to stop
                        writeStream.on('finish', function () {
                            fileCount--;
                            if (fileCount == 0) {
                                gruntDone();
                            }
                        });
                    }
                });
            });
        });

        /**
         * An object that describe and build a File that need to execute include-me
         * @param srcFilePath: the path of src file need to execute include-me
         * @param dest: {{string}} meansthe path of destination file, {{undefined}} means to cache obj.
         * @constructor
         */
        function IncludeFile(srcFilePath, destFilePath) {


        }

        var watchTree = {},
            Q = require('q');


        function Include(path) {
            var data = [];
            var watchTree = Include.prototype.watchTree,
                queue = Include.prototype.queue;


            var ctrl = {
                injectMe: function (id, index) {

                },
                done: function (cb) {
                    cb && cb();
                }
            };


            fs.createReadStream(path)
                .pipe(split())
                .pipe(through(function (buffer, encoding, next) {
                    var line = buffer.toString(),
                        file = line.match(INCLUDE_REP);//extract include file from directive

                    if (file !== null) {
                        var filePath = resolvePath(path, file[1]);
                        console.log(path, line, filePath);
                        // include the file
                        includeFile(filePath, this, next);
                    } else {
                        buffer = Buffer.concat([buffer, new Buffer('\n')]);
                        this.push(buffer);
                        next();
                    }
                }));


            return ctrl;
        }

        Include.prototype.queue = [];
        Include.prototype.watchTree = {};

        function includeFile(path, cache, afterInclude) {
            return fs.createReadStream(path)
                .pipe(split())
                .pipe(through(function (buffer, encoding, next) {
                    var line = buffer.toString(),
                        file = line.match(INCLUDE_REP);//extract include file from directive

                    grunt.log.ok(line, file && file[1])
                    if (file !== null) {
                        var filePath = resolvePath(path, file[1]);
                        console.log(path, line, filePath);
                        // include the file
                        includeFile(filePath, this, next);
                    } else {
                        buffer = Buffer.concat([buffer, new Buffer('\n')]);
                        this.push(buffer);
                        cache && cache.push(buffer);
                        next();
                    }
                }, function (done) {
                    done();
                    afterInclude && afterInclude();
                }));
        }

        function resolvePath(basePath, includePath) {
            var rtn = path.join(path.dirname(basePath), includePath);
            if (!path.extname(rtn)) {
                rtn = rtn + path.extname(basePath);
            }
            return rtn;
        }

    });

};
