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
    var Dag = require('./lib/Dag');

    var Q = require('q'),
        fs = require('fs'),
        fswrite = Q.denodeify(fs.writeFile);

    var mine = global._include_me = global._include_me || {
            pathspace: {__total: 0},
            dag: new Dag
        },
        pathspace = mine.pathspace,
        dag = mine.dag;
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

        var split = require('split'),
            through = require('through2'),
            path = require('path'),
            fse = require('fs-extra');

        var fileCount = 0;
        var INCLUDE_REP = new RegExp('^\\s*' + options.directive + '\\s*([\\w/.]+)\\s*$');
        var temp = {};
        this.files.forEach(function (f) {
            f.src.forEach(function (src) {
                console.log(src, f.dest)
                var dest = f.dest;
                fileCount++;
                var include = getInclude(src);
                include.done(function (content) {
                    // make sure the destination file is created already
                    fse.ensureFile(dest, function () {
                        fswrite(dest, content)
                            .done(function () {
                                if (!options.watch) {
                                    //after all write finish, notify grunt to stop
                                    fileCount--;
                                    if (fileCount == 0) {
                                        gruntDone();
                                    }
                                }
                            });
                    });
                });
            });
        });

        /**
         * An object that describe and build a File that need to execute include-me
         * @param path
         * @constructor
         */
        function Include(path) {
            var data = [];

            var me = this,
                deferred = Q.defer(),
                promise = deferred.promise,
                waitCount = 0,
                seperated = true,
                isDone = false;
            me.done = promise.done.bind(promise);
            me.id = getId(path);

            fs.createReadStream(path)
                .pipe(split())
                .pipe(through(function (buffer, encoding, next) {
                    var line = buffer.toString(),
                        file = line.match(INCLUDE_REP);//extract include file from directive
                    if (file !== null) {
                        seperated = false;
                        waitCount++;
                        var filePath = resolvePath(path, file[1]),
                            index = data.length;
                        grunt.verbose.ok('[' + path + '] find file to include:' + filePath);
                        // include the file
                        me.include(filePath).promise
                            .done(function (content) {
                                data[index] = content;
                                waitCount--;
                                if (waitCount == 0 && isDone) {
                                    var content = data.join('');
                                    deferred.resolve(content);
                                }
                            });
                        data.push(null);
                    } else {
                        data.push(buffer.toString() + '\n');
                    }
                    next();
                }, function (done) {
                    if (seperated || waitCount == 0) {
                        var content = data.join('');
                        deferred.resolve(content);
                    }
                    isDone = true;
                    done();
                }));
        }

        function resolvePath(basePath, includePath) {
            var rtn = path.join(path.dirname(basePath), includePath);
            if (!path.extname(rtn)) {
                rtn = rtn + path.extname(basePath);
            }
            return rtn;
        }

        /**
         * get an id/path 's Include obj
         * if argument has myId means a dag relation should be establish
         * @param path
         * @param myId
         * @returns {*|module.Include}
         */
        function getInclude(path,myId){
            var id = path;
            if(typeof path !== 'number'){
                id = getId(path);
            }
            if(myId!==undefined){
                dag.vector(id,myId);
            }
            return dag.data(id)||new Include(path);;
        }

    });

};
