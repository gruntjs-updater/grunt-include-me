var fs = require('fs');
var Q = require('q');
var fse = require('fs-extra');
var split = require('split');
var through = require('through2');
var path = require('path');
var INCLUDE_REP = new RegExp('^\\s*@include\\s*([\\w/.]+)\\s*$');

var test = 'test.hbs';
function Include(path){
    var data = this.data = [];
    var deferred = Q.defer();
    var pathMap = Include.prototype.pathMap;
    pathMap[path] = this;


    return {
        injectMe:function(another){


        },
        shouldInject:function(path,index){

        },
        done:deferred.done,
        start:function(){
            var queue=Include.prototype.queue;

            fs.createReadStream(path)
                .pipe(split())
                .pipe(through(function (buffer, encoding, next) {
                    var line = buffer.toString(),
                        file = line.match(INCLUDE_REP);//extract include file from directive

                    if (file !== null) {
                        var filePath = resolvePath(path, file[1]);
                        var include = new Include(filePath)
                        queue.push(include);
                        include

                    } else {
                        buffer = Buffer.concat([buffer,new Buffer('\n')]);
                        this.push(buffer);
                        cache && cache.push(buffer);
                        next();
                    }
                }, function (done) {
                    done();
                    afterInclude && afterInclude();
                }));
            return this;
        },
    }
}
Include.prototype.queue=[];
Include.prototype.pathMap={};

Include.start=function(){
    Include.prototype.queue.forEach(function(include){
        include.start().done(Include.start);
    });
}


new Include('test/src/all.hbs');
Include.start();


function resolvePath(basePath, includePath) {
    var rtn = path.join(path.dirname(basePath), includePath);
    if (!path.extname(rtn)) {
        rtn = rtn + path.extname(basePath);
    }
    return rtn;
}
