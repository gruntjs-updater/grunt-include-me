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
    if (isId(ROOT)) {
        this._root.add(ROOT);
    } else if (isArray(ROOT)) {
        _root.concat(ROOT);
    } else {//object
        extend(this._data, ROOT, this._root);
    }
}
var dp = Dag.prototype;
dp.parent = function (id) {
    return this._parents[id] || [];
};
/**
 * show all my parents include ancestors
 * @param id
 */
dp.parents = function(id){
    var parentsView = this._parents,myParent = this.parent(id),rtn = new Set(myParent);
    myParent.forEach(function(p){
        rtn.cat(parentsView[p]);
    });
    return rtn;
};
dp.child = function (id) {
    return this._children[id] || [];
};
dp.children = function(id){
    var childrenView = this._children,myChild = this.child(id),rtn = new Set(myChild);
    myChild.forEach(function(c){
        rtn.cat(childrenView[c]);
    });
    return rtn;
};
dp.vector = function (v) {
    var to, hisParents, myChildren;

    var _parents = this._parents, _children = this._children;
    for (var from in v) {
        to = v[from];
        hisParents = _parents[from] = _parents[from] || new Set;

        if (isId(to)) {
            myChildren = _children[to] = _children[to] || new Set;
            addRelation(from, to, hisParents, myChildren);
        } else if (isArray(to)) {//array
            to.forEach(function (realTo) {
                myChildren = _children[realTo] = _children[realTo] || new Set;
                addRelation(from, realTo, hisParents, myChildren);
            });
        }


    }
}
function addRelation(from, to, hisParents, myChildren) {
    //circle rely detect
    if (from == to) {
        throw new Error('circle rely:' + from + ' ' + to);
    }
    hisParents.add(to);
    myChildren.add(from);
}

dp.data = function (id, data) {
    if (data === undefined) {
        return this._data[id];
    }
    this._data[id] = data;
    return this;
}

dp.sonless = function (id) {
    var childrenView = this._children,
        parentsView= this._parents,
        oldChildren = childrenView[id];
    childrenView[id]=new Set;
    oldChildren.forEach(function(c){
        parentsView[c].remove(id);
    });
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
Set.prototype = Array.prototype;
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
    if(!arr||!arr.length){
        return;
    }
    var i = arr.length;
    while (i--) {
        this.add(arr[i]);
    }
}

module.exports = Dag;
