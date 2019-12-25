//玩家数据记录,需要终身保存
"use strict"

const dbase = require("../dbase");
const ObjectID = require("../ObjectID");

class record extends dbase.mongo {
    constructor(sid,uid) {
        super(sid,'record',true);
        this.uid = uid;
        this.ObjectID = ObjectID.bind(this,this.uid);
    }

    setOnInsert(id){
        return {"id":parseInt(id),"uid":this.uid};
    }

    uget(id){
        let query = this.query(id),fields = arguments[1]||[];
        if(fields.length === 0){
            fields.push('val');
        }
        let option = {"multi":true,"dataType":"json","fields":this.fields(fields)};
        return this.find(query, option);
    }
    mget(keys) {
        let query = {uid:this.uid}
        let option = {multi:true,fields:this.fields(keys),key:"id"};
        option["fields"]['id'] = 1;
        return this.find(query,option);
    }
}


module.exports = function(sid,uid){
    return new record(sid,uid);
};

//索引
module.exports.indexes = [
    [{"uid":1},{}],
]