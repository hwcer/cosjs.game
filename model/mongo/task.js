//索引:uid
"use strict"
const mvc = require("cosjs.mvc");
const dbase = require("../dbase");
const ObjectID = require("../ObjectID");

class task extends dbase.mongo {
    constructor(sid,uid){
        super(sid, 'task',true);
        this.uid = uid;
        this.ObjectID = TASK_ObjectID.bind(this);
    }

    setOnInsert(id){
        let config = mvc.config("task",id);
        if(!config){
            throw new Error(`task config[${id}] not exist`)
        }
        let key = config['series'] || parseInt(id);

        return {"id":key,"uid":this.uid};
    }

    //获取列表
    mget(){
        let query = {"uid": this.uid};
        let option = {"multi":true,"fields":{"_id":0,"id":1,"val":1,"ttl":1},"key":"id"};
        return this.find(query, option);
    }

}

module.exports = function(sid,uid){
    return new task(sid,uid);
}

//索引
module.exports.indexes = [
    [{"uid":1},{}],
]

//如果是任务链直接使用任务链ID作为key
function TASK_ObjectID(id){
    if(ObjectID.verify(this.uid,id) ){
        return id;
    }

    let config = mvc.config("task",id);
    if(!config){
        throw new Error(`task config[${id}] not exist`)
    }
    let key = config['series'] || id;
    return ObjectID(this.uid,key);
}