//好友系统 uid,fid索引
/*
config.submit: 0-关注[单向好友不需要确认]，1-双向不需要确认，2-双向需要确认
 */
"use strict"
const mvc = require("cosjs.mvc");
const dbase = require("../dbase");
const ObjectID = require("../ObjectID");

class friend extends dbase.mongo {
    constructor(sid){
        super(sid, 'friend',false);
    }
//删除好友
    udel(uid,fid){
        let config = mvc.config.get("friend");
        if(!config){
            return mvc.library('promise/callback', "config_not_exist","friend");
        }
        let ids = [];
        ids.push(ObjectID(uid,fid));
        if(config["apply"] > 0){
            ids.push(ObjectID(fid,uid));
        }
        return this.del(ids);
    }
    uget(uid,fid){
        let oid = ObjectID(uid,fid);
        let keys = ["uid","fid","val"];
        let query  = this.query(oid);
        let option = {"multi":this.isMulti(oid) ,"fields":this.fields(keys),"key":"fid"};
        option['fields']["fid"] = 1;
        option['fields']["_id"] = -1;
        return this.find(query,option);
    }
    //批量计算好友数量,
    sum(uid){
        let val = arguments[1]||1;
        let query = {"val":{"$gte":val} };
        if(Array.isArray(uid)){
            query["uid"] = { "$in" : uid};
        }
        else{
            query["uid"] = uid;
        }
        let options = {};
        let pipeline = [{ "$match" : query }, { "$group":{"_id" : "$uid", "num" : {"$sum" : 1}}}];
        return this.aggregate(pipeline, options);
    }
    //粉丝数量,关注模式才有意义
    follow(uid){
        let query = {"fid": uid,"val":{"$gte":1} };
        return this.count(query);
    }
    //申请好友
    apply(uid,fid) {
        let time = Date.now();
        let config = mvc.config.get("friend");
        if(!config){
            return promise.callback("config_not_exist","friend");
        }
        let option = {"multi":false,"upsert":true};
        this.multi();
        //自己的好友
        let sv = config['apply'] < 2 ? 1:-1;
        let sf = format_update.call(this,uid,fid,sv,time);
        this.update(sf.query,sf.update,option);
        //对方的好友列表
        //关注模式需要提示对方，双向不需要确认直接成为好友，双向确认模式等待确认
        let pv = config['apply'] == 1 ? 1:0;
        let pf = format_update.call(this,fid,uid,pv,time);
        this.update(pf.query,pf.update,option);
        //保存
        return this.save();
    }
    //拒绝好友申请
    refuse(uid,fid){
        let config = mvc.config.get("friend");
        if(config['apply'] == 1){
            return promise.callback(null,config['apply']);
        }
        let option = {"multi":true};
        this.multi();
        //处理个人申请列表
        let mq = {"val":0};
        if(fid){
            mq["_id"] = ObjectID(uid,fid);
        }else{
            mq['uid'] = uid;
        }
        this.remove(mq,option);
        //双向模式处理对方列表
        if(config['apply'] > 0){
            let yq = {"val":-1};
            if(fid){
                yq["_id"] = ObjectID(fid,uid);
            }else{
                yq['fid'] = uid;
            }
            this.remove(yq,option);
        }
        return this.save();
    }
    //通过申请,关注模式为加对方好友
    //fid,callback
    accept(uid,fid){
        let config = mvc.config.get("friend");
        if(config['apply'] == 1){
            return promise.callback(null,config['apply']);
        }

        if(fid) {
            let arr = [];
            arr.push(ObjectID(uid,fid));
            if (config['apply'] >= 2) {
                arr.push(ObjectID(fid,uid));
            }
            return this.set(arr, "val", 1);
        }
        else {
            this.multi();
            let update = {"val":1};
            let option = {"multi":true,"upsert":false};

            this.update({"uid":uid,"val":0},update,option);
            if(config['apply'] > 0){
                this.update({"fid":uid,"val":-1},update,option);
            }
            return this.save();
        }
    }
}

module.exports = function(sid){
    return new friend(sid);
}


function format_update(uid,fid,val,time){
    let query = {"_id":ObjectID(uid,fid)}
    let update = { "$set":{"time":time},"$setOnInsert":{"uid":uid,"fid":fid,"val":val} };
    return {"query":query,"update":update};
}
