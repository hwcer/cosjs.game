//
"use strict"
const dbase = require("../dbase");
class item extends dbase.mongo {
    constructor(sid,uid){
        super(sid,'item');
        this.uid = uid;
        this.ObjectID = ObjectID.bind(this);
    }
    uget(id){
        let query = this.query(id),fields = arguments[1]||[];
        query["uid"] = this.uid;
        let option = {"multi":true,"fields":this.fields(fields)};
        return this.find(query, option);
    }
    //获取玩家道具列表
    mget(bag){
        let query = {"uid": this.uid};
        let option = {"multi":true,"dataType":"array","limit":500,'batchSize':500};
        if(bag){
            query["bag"] = bag;
        }
        return this.find(query, option);
    }



}



module.exports = function(sid,uid){
    return new item(sid,uid);
};

//索引
module.exports.indexes = [
    [{"uid":1,"bag":1},{}]
]

function ObjectID(id){
    if(!id) {
        throw new Error("model[item].ObjectID id empty");
    }
    return id;
}