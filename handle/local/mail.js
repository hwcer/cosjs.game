"use strict"
const mvc = require("cosjs.mvc");

exports.page = function(){
    let $page = this.get('page', 'int') || 1;
    let $size = this.get('size', 'int') || 20;
    let $sort = this.get('sort');
    let $order = this.get('order') || 'desc';
    let dbsort = {};
    if ($sort) {
        dbsort[$sort] = $order == 'desc' ? -1 : 1;
    }
    else{
        dbsort['time'] = -1;
    }

    let body = this.req.body;
    let format = mvc.format("mail");

    let query = this.library.call(this,'jqgrid/query',body,format);
    let option = {};
    let model = this.model.mongo("mail",this.sid);
    return model.page(query, $page, $size, dbsort, option);
}


exports.save = function () {
    let act = this.get('act');
    switch (act){
        case "del":
            return del.call(this);
        case "add":
            return add.call(this);
        case "edit":
            return edit.call(this);
        default:
            return this.error("req.act["+act+"] not exist ");
    }
}




function del() {
    let id = this.get('id','string');
    if ( !id ) {
        return this.error('args[id] empty');
    }
    let model = this.model.mongo("mail",this.sid);
    return model.del(id);
}



function edit(){
    let id = this.get('id','string');
    if ( !id ) {
        return this.error('id不能为空');
    }

    let format = mvc.format("mail");
    let info = getPostData.call(this,format,'edit');
    if(!info){
        return false;
    }
    let model = this.model.mongo("mail",this.sid);
    return model.set(id,info);
}

function add() {
    let format = mvc.format("mail");
    let info = getPostData.call(this,format,'add');
    if(!info){
        return false;
    }
    let uid = info["uid"].split(",");
    delete info["uid"];
    let model = this.model.mongo("mail",this.sid);
    for(let u of uid){
        model.add(u,info);
    }
    return uid.length;
}


function getPostData(format,act){
    let info = {};
    for (let k in format) {
        if(format[k][act]){
            info[k] = this.get(k, format[k]['type'])||format[k]['val'] ;
        }
        if( format[k][act] > 1 && !info[k] ){
            let name = format[k]['name'] || k;
            return this.error(`${name}不能为空`);
        }
    }
    return info;
}