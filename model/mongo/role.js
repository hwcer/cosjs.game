//游戏角色
"use strict"
const mvc          = require('cosjs.mvc');
const dbase        = require("../dbase");
const gzone        = mvc.config.get("gzone");

class role extends dbase.mongo {
    constructor(sid){
        super(sid,'role');
        this.sid = sid;
        this.uid = arguments[1]||'';
        this.ObjectID = ObjectID.bind(this);
    }
    uget(keys){
        let query = {"_id":this.uid};
        let option = {multi:false,fields:this.fields(keys) };
        return this.find(query,option);
    }
    //[uid],key
    get(){
        let uid,key;
        if(arguments.length >= 2){
            uid = arguments[0];key = arguments[1];
        }
        else{
            uid = this.uid;key = arguments[0];
        }
        if(!uid){
            return Promise.reject('model.role.get uid empty');
        }
        return super.get(uid,key);
    }
    //[uid],key,val
    set(){
        let uid,key,val;
        if(arguments.length >= 3){
            uid = arguments[0];key = arguments[1];val = arguments[2];
        }
        else{
            uid = this.uid;key = arguments[0];val = arguments[1];
        }
        if(!uid){
            return Promise.reject('model.role.set uid empty');
        }
        return super.set(uid,key,val);
    }
    incr(){
        let uid,key,val;
        if(arguments.length >= 3){
            uid = arguments[0];key = arguments[1];val = arguments[2];
        }
        else{
            uid = this.uid;key = arguments[0];val = arguments[1];
        }
        if(!uid){
            return Promise.reject('model.role.set uid empty');
        }
        return super.incr(uid,key,val);
    }

    //查询用户角色列表
    findFromGuid(guid,keys){
        let query = {"guid":guid};
        let fields = this.fields(keys);
        let option = {"multi":true,"dataType":'array',"fields":fields };
        return this.find(query,option);
    }
    //通过NAME查询
    findFromName(name,keys){
        let query = {"name":name};
        let option = {"multi":true,"dataType":'array',"fields":this.fields(keys) };
        return this.find(query,option);
    }
}

module.exports = function(sid,uid){
    return new role(gzone ? sid : 0,uid);
}

//索引
module.exports.indexes = [
    [{"guid":1},{}],
    [{"time":-1},{}]
]

function ObjectID(id){
    if(!id) {
        throw new Error("model[character].ObjectID id empty");
    }
    return id;
}