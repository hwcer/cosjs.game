//订单系统
"use strict"
const mvc = require("cosjs.mvc")
const dbase = require("../dbase");
const promise = mvc.library.require("promise");

class order extends dbase.mongo {
    constructor(sid){
        super(sid,'order');
    }
    mget(uid,time){
        let query = {"uid":uid,"status":9};
        if(time){
            query['time'] = {"$gt":time};
        }
        let option = {"multi":true};
        return this.find(query,option);
    }
    //累计充值钻石数量
    sum(uid,keys,STime,ETime){
        let multi = true;
        let query = {"uid":uid,"status":9} ,
            group = {"_id":"$item","val":{"$sum" : "$val"},"num":{"$sum":1}} ,
            options = {};
        if(Array.isArray(keys)) {
            query["item"] = {"$in":keys}
        }
        else if(keys){
            query["item"] = keys;multi =false;
        }
        if(STime || ETime){
            query['time'] = {};
        }
        if(STime){
            query['time']['$gte'] = STime;
        }
        if(ETime){
            query['time']['$lte'] = ETime;
        }
        let pipeline = [{ $match : query }, {$group:group}];
        return this.aggregate(pipeline, options).then(ret=>{
            if(!ret || ret.length ===0){
                return promise.callback(null,multi ? [] : null);
            }
            else {
                return promise.callback(null,multi ? ret : ret[0]);
            }
        });
    }
}

module.exports = function(sid){
    return new order(sid);
};

//索引
module.exports.indexes = [
    [{"uid":1},{}],
    [{"time":1},{}]
]