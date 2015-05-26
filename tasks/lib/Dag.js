/**
 * Created by yuhuan.wang on 2015-05-24.
 *
 * a light weight Directed Acyclic Graph lib
 * has ROOT
 * space for time
 *
 * https://www.npmjs.com/package/graph.js
 * https://www.npmjs.com/package/directed-graph-to-dag
 */


function Dag(ROOT) {
    this._parents = {};// parent's view: who I rely on, in another word find my direct parents
    this._children = {};// child's view: who rely on me, in another word find my direct children
    this._root = new Set;
    this._data = {};//store all vertex's data
    if (ROOT !== undefined) {
        if (isId(ROOT)) {
            this._root.add(ROOT);
        } else if (isArray(ROOT)) {
            _root.concat(ROOT);
        } else {//object
            extend(this._data, ROOT, this._root);
        }
    }
}

var dp = Dag.prototype;
dp.root = function (id, value) {
    if (value === undefined) {
        return this._root;
    }
    this._root.add(id);
};
dp.parent = function (id) {
    return this._parents[id] || [];
};
/**
 * show all my parents include ancestors
 * @param id
 */
dp.parents = function (id) {
    var parentsView = this._parents, myParent = this.parent(id), rtn = new Set(myParent);
    myParent.forEach(function (p) {
        rtn.cat(parentsView[p]);
    });
    return rtn;
};
dp.rootParents = function(id){
    var me = this;
    return me.parents(id).filter(function(item){
        if(me.parent(item).length===0){
            return true;
        }
    });
}
dp.child = function (id) {
    return this._children[id] || [];
};
dp.children = function (id) {
    var childrenView = this._children, myChild = this.child(id), rtn = new Set(myChild);
    myChild.forEach(function (c) {
        rtn.cat(childrenView[c]);
    });
    return rtn;
};
dp.vector = function addVector(from, to) {
    if (to === undefined) {
        for (var f in from) {
            addVector.call(this, f, from[f]);
        }
        return this;
    }
    var me = this;

    if (isId(to)) {
        addRelation.call(me, from, to);
    } else if (isArray(to)) {//array
        to.forEach(function (realTo) {
            addRelation.call(me, from, realTo);
        });
    }
}
function addRelation(from, to) {
    var hisParents = this._parents[from] = this._parents[from] || new Set,
        myChildren = this._children[to] = this._children[to] || new Set;
    //circle rely detect
    if (hasCircle.call(this, from, to)) {
        this.print(from, to);
        throw new Error('circle rely:' + from + ' ' + to);
    }
    hisParents.add(to);
    myChildren.add(from);
}
function hasCircle(from, to) {
    if (from == to) {
        return true;
    }
    return this.parents(to).contains(from) || this.children(from).contains(to);
}

dp.data = function (id, data) {
    if (data === undefined) {
        return this._data[id];
    }
    this._data[id] = data;
    return this;
}
dp.removeData = function(id){
    this._data[id]=undefined;
}

dp.sonless = function (id) {
    var childrenView = this._children,
        parentsView = this._parents,
        oldChildren = childrenView[id];
    childrenView[id] = new Set;
    oldChildren && oldChildren.forEach(function (c) {
        parentsView[c].remove(id);
    });
}
var chalk = require('chalk');
/**
 * print in parent's view
 * so you will know one's direct children easily
 */
dp.print = function (from, to) {
    var childrensView = this._children,
        msg = chalk.blue('\n===include view===start===\n');

    for (var i in childrensView) {
        var children = childrensView && childrensView[i] || [];
        if (i === to) {
            children.push(from);
        }
        var singleMsg = i + ':[' + children.join(', ') + ']\n';
        var REGEXP = new RegExp('(' + from.replace(/\//g, '\\\/') + '|' + to.replace(/\//g, '\\\/') + ')', 'g');

        msg += singleMsg.replace(REGEXP, function (all, g1) {
            return chalk.red(g1);
        });
    }
    msg += chalk.blue('===include view===end===\n');
    console.log(msg);
}

function isId(o) {
    var type = typeof o;
    return type == 'string' || type == 'number';
}

function isArray(o) {
    return Object.prototype.toString.call(o) == '[object Array]';
}

function extend(o1, o2, vertexSet) {
    for (var i in o2) {
        o1[i] = o2[i];
        vertexSet && vertexSet.add(i);
    }
    return o1;
}

function Set(arr) {
    this.cat(arr);
}

Set.prototype = new Array;
var sp = Set.prototype;
sp.constructor = Set;

sp.add = function (id) {
    if (!this.contains(id)) {
        this.push(id);
    }
};
sp.remove = function (id) {
    var index = this.indexOf(id);
    if (index != -1) {
        this.splice(index, 1);
    }
};
sp.contains = function (id) {
    return this.indexOf(id) != -1;
};
sp.indexOf = function (id) {
    var index = -1;
    this.some(function (item, i) {
        if (item == id) {
            index = i;
            return true;
        }
    })
    return index;
};
sp.cat = function (arr) {
    if (!arr || !arr.length) {
        return this;
    }
    var i = arr.length;
    while (i--) {
        this.add(arr[i]);
    }
    return this;
}
module.exports = Dag;

