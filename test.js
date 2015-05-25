var fs = require('fs');
var Q = require('q');

var deferred = Q.defer();
fs.readFile("test.hbs", "utf-8", function (error, text) {
    if (error) {
        deferred.reject(new Error(error));
    } else {
        deferred.resolve(text);
    }
});
var promise = deferred.promise;

promise.done(function(text){
    console.log(text);
});

setTimeout(function(){
    promise.done(function(text){
        console.log(text);
    });
},1000)