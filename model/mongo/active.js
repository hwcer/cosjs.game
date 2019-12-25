//活动记录
//索引:[uid,ttl]
//prefix：0-普通，1-日常活动
"use strict"
const dbase = require("../dbase");
const ObjectID = require("../ObjectID");

class active extends dbase.mongo {
    constructor(sid,uid){
        super(sid, 'active',true);
        this.uid = uid;
        this.ObjectID = ObjectID.bind(this,uid);
    }
    setOnInsert(id){
        return {"id":id,"uid":this.uid};
    }
    //10001  10001
    uget(id){
        let time = Date.now(),query = this.query(id),fields = arguments[1]||[];
        if(fields.length===0){
            fields.push('val');
        }
        fields.push('ttl');
        query["$or"] =  [{"ttl":{"$gte":time}},{"ttl":0}];
        let option = {"multi":true,"dataType":"json","fields":this.fields(fields)};
        return this.find(query, option);
    }
    mget() {
        let time = Date.now();
        let query = {"uid":this.uid,"$or":[{"ttl":{"$gte":time}},{"ttl":0}]  }                             //有效期大于当前时间，或者等于0[永久有效]
        let option = {"multi":true,"fields":{"_id":0,"id":1,"val":1},"key":"id"};
        return this.find(query,option);
    }

    //清理数据
    clear(){
        let nowTime = Date.now();
        let expireTime = nowTime - 30 * 86400 * 1000;
        let query = {"$and":[ {"time":{"$lt": expireTime}},{"time":{"$gt": 0}} ]};
        let option = {"multi":true};
        return this.remove(query,option);
    }
}

module.exports = function(sid,uid){
    return new active(sid,uid);
}

module.exports.indexes = [
    [{"uid":1},{}]
]