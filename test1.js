var a = 'app/aaa/ddd/app/scss/scss'

var firstApp=true;
var re = {
    app:'firstApp',
    scss:'lastScss'
}
console.log(a.replace(/(app|scss$)/g,function(all,g1,index){
    if(g1=='app'){
        if(firstApp){
            firstApp=false;
        }else{
            return g1;
        }
    }
    return re[g1];
}));