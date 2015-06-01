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
        //var id = pathspace[path];
        //if (id === undefined) {
        //    id = pathspace[path] = ++pathspace.__total;
        //}
        //return id;
        return path;
    }

    //TODO expand charset&encoding
    grunt.registerMultiTask('include_me', 'grunt plugin to make including file easier', function () {
        var options = this.options({
            directive: '@include',
            watch: false,
            watchSeperate: false
        });
        var gruntDone = this.async();

        var split = require('split'),
            through = require('through2'),
            path = require('path'),
            fse = require('fs-extra'),
            gaze = require('gaze'),
            Gaze = gaze.Gaze;

        var fileCount = 0;
        var INCLUDE_REP = new RegExp('^\\s*' + options.directive + '\\s*([\\w/.]+)\\s*$');
        var temp = {};
        this.files.forEach(function (f) {
            f.src.forEach(function (src) {
                grunt.verbose.ok('in:' + src + ' ; out:' + f.dest);
                var dest = f.dest;
                fileCount++;
                var include = getInclude(src);
                include.write = function (content) {
                    if (content === undefined) {
                        content = this.getContent();
                        console.log(content)
                    }
                    // make sure the destination file has been created already
                    fse.ensureFile(dest, function () {
                        fswrite(dest, content)
                            .done(function () {
                                if (!options.watchSeperate) {
                                    //after all write file task finished, notify grunt to stop
                                    fileCount--;
                                    if (fileCount == 0) {
                                        gruntDone();
                                    }
                                }
                            });
                    });
                }
                include.done(include.write);
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
                isDone = false,
                injectData = {};// record the place of each include file should be injected to

            me.done = promise.done.bind(promise);
            var id = me.id = getId(path);
            me.destroy = function () {
                deferred = null;
                promise = null;
                me = null;
                data = null;
                injectData = null;
            };
            me.change = function (path) {
                deferred = Q.defer();
                promise = deferred.promise;
                this.done = promise.done.bind(promise);
                waitCount++;
                injectData[path]();
                this.done(this.write.bind(this));
                return this;
            };
            me.write = function () {
            };
            me.getContent = function () {
                return data.join('');
            };

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

                        var doInclude = injectData[filePath] = function () {
                            getInclude(filePath, id)
                                .done(function (content) {
                                    data[index] = content;
                                    waitCount--;
                                    if (waitCount == 0 && isDone) {
                                        var content = data.join('');
                                        deferred.resolve(content);
                                    }
                                });
                        };
                        // include the file
                        doInclude();
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
         */
        function getInclude(path, myId) {
            var id = path;
            if (typeof path !== 'number') {
                id = getId(path);
            }
            if (myId !== undefined) {
                dag.vector(id, myId);
            }
            var include = dag.data(id);
            if (!include) {
                include = new Include(path);
                include.gaze = new Gaze(path).on('all', function () {
                    dag.sonless(path);
                    var oldInclude = dag.data(path);
                    var newInclude = new Include(path);
                    newInclude.write = oldInclude.write;
                    dag.data(path, newInclude);
                    oldInclude.destroy();
                    noticeParent(path);
                    newInclude.done(function () {
                        newInclude.write()
                    });
                });
                dag.data(id, include);
            }
            return include;
        }

        function noticeParent(id) {
            var parent = dag.parent(id);
            if (parent.length !== 0) {
                parent.forEach(function (p) {
                    getInclude(p).change(id);
                    //i.done(i.write.bind(i));
                    noticeParent(p);
                });
            }
        }

    });

};
