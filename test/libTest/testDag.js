/**
 * Created by yuhuan.wang on 2015-05-24.
 */

var Dag = require('../../tasks/lib/Dag.js');

var dag = new Dag('A');

dag.vector({
    'B': 'A',
    'C': ['A', 'B'],
    'D': 'B'
});

dag.data('A', {info: 'someData'});

log(dag.child('A'));//BC
log(dag.children('A'));//BCD
log(dag.child('B'));//CD
log(dag.parent('B'));//A
log(dag.parent('D'));//B
log(dag.parents('D'));//AB

dag.sonless('B');

log(dag.parents('D'));//null
log(dag.children('A'));//BC


console.dir(dag.data('A'));//{info: 'someData'}

function log(arr){
    console.log(arr.join(',')||null)
}