"use strict"
const mvc = require("cosjs.mvc");
exports.page = function(){
    let $page = this.get('page', 'int') || 1;
    let $size = this.get('size', 'int') || 20;
    let $sort = this.get('sort') || '_id';
    let $order = this.get('order') || 'desc';
    let dbsort = {};
    if ($sort) {
        dbsort[$sort] = $order == 'desc' ? -1 : 1;
    }

    let body = this.req.body;
    let format = mvc.format("role");

    let query = this.library.call(this,'jqgrid/query',body,format);
    let option = {};
    let  model = this.model.mongo("role",this.sid);
    return model.page(query, $page, $size, dbsort, option);
}

