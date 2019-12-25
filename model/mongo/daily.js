//用户日常活动记录
"use strict"
const mvc = require("cosjs.mvc")
const dbase = require("../dbase")

class daily extends dbase.mongo{
    constructor(sid,uid) {
        super(sid,'daily',true);
        this.uid  = uid;
        this.time = mvc.library("time/sign");
        this.ObjectID = ObjectID.bind(this);
    }

    setOnInsert(id){
        return {"uid":id,"time":this.time};
    }
    uget(keys){
        return this.get(this.uid,keys);
    }
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
//获取特定时间段内单个用户数据
    mget(STime,ETime){
        let query = {"uid":this.uid};
        if(STime || ETime){
            query["time"] = {};
        }
        if(STime){
            query['time']['$gte'] = mvc.library("time/sign",STime);
        }
        if(ETime){
            query['time']['$lte'] = mvc.library("time/sign",ETime);
        }
        let option = {"key":"time","multi":true};
        return this.find(query, option);
    }

//统计复合条件的天数
    days(STime,ETime,key,val){
        let query = {"uid":this.uid};
        if(STime || ETime){
            query["time"] = {};
        }
        if(STime){
            query['time']['$gte'] = mvc.library("time/sign",STime);
        }
        if(ETime){
            query['time']['$lte'] = mvc.library("time/sign",ETime);
        }
        query[key] = {'$gte':val};
        return this.count(query);
    }

//统计一段时间内的记录之和
    sum(STime,ETime,keys){
        let query = {"uid":this.uid} ,group = {_id:"$uid"} , options = {};
        if(STime || ETime){
            query['time'] = {};
        }
        if(STime){
            query['time']['$gte'] = mvc.library("time/sign",STime);
        }
        if(ETime){
            query['time']['$lte'] = mvc.library("time/sign",ETime);
        }
        let arr = Array.isArray(keys) ? keys : [keys];
        for(let key of arr){
            let ak = expression(key);
            group[ak] = {$sum : '$'+key}
        }
        let pipeline = [{ $match : query }, {$group:group}];
        return this.aggregate(pipeline, options).then(ret=>{
            let result = {};
            if(!ret || !ret[this.uid] ){
                return result;
            }

            for(let key of arr){
                let ak = expression(key);
                result[key] = ret[this.uid][ak] ||0;
            }
            return result;
        });
    }
//统计本周记录
    week(keys){
        let STime = mvc.library("time/week",arguments[1]||0);
        let ETime = 0;//STime + 6 * 86400 * 1000;
        return this.sum(STime,ETime,keys)
    }
    //清理数据
    clear(){
        let nowTime = Date.now();
        let expireTime = nowTime - 30 * 86400 * 1000;
        let query = {"time":{"$lte": expireTime }};
        let option = {"multi":true};
        return this.remove(query,option);
    }
}


module.exports = function(sid,uid){
    return new daily(sid,uid);
}

//索引
module.exports.indexes = [
    [{"uid":1,"time":-1},{}]
]


function ObjectID(uid){
    if(String(uid).indexOf("-")>0){
        return uid;
    }
    return [uid,this.time].join("-");
}

function expression(){
    let key = String(arguments[0]);
    if(key.indexOf('.') < 0){
        return key;
    }
    let arr = key.split(".");
    return arr.join('_');
}