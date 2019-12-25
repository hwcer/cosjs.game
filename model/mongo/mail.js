//邮件系统
"use strict"
const mvc = require("cosjs.mvc")
const dbase = require("../dbase");
const promise = mvc.library.require("promise");

class mail extends dbase.mongo{
    constructor(sid){
        super(sid,'mail');
    }
    //获取列表，time：最后更新时间，客户端增量更新
    mget(uid,keys,time = 0){
        let query = {"uid": uid,"time":{"$lte":Date.now()}, "status":{"$lt":9}};
        if(time > 0){
            query['time']['$gt'] = time;
        }
        let option = {"multi":true,"dataType":"array",fields:this.fields(keys) };
        return this.find(query, option);
    }
    //添加邮件
    add(uid,data){
        let info = mail_format.call(this,uid,data);
        return this.insert(info);
    }
    //系统邮件,id,data......
    sys(uid,id,data,...arr){
        let sysMail = mvc.config('mail',id);
        if(!sysMail){
            return promise.callback('config_not_exist',['mail',id]);
        }
        data['type']  = 1;
        arr.unshift(id);
        for(let i in arr){
            arr[i] = encodeURIComponent( arr[i] );
        }
        data['title'] = arr.join(',');
        data['content'] = '';
        return this.add(uid,data);
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


function mail_format(uid){
    let data = Object.assign({},arguments[1]);
    if(!data['uid']){
        data['uid'] = uid;
    }
    if(!data['time']){
        data['time'] = Date.now();
    }
    mvc.format('mail',data,true);
    if(!data['_id']){
        data['_id'] = this.ObjectID();
    }
    return data;
}


module.exports = function(sid){
    return new mail(sid);
};


//索引
module.exports.indexes = [
    [{"uid":1},{}],
    [{"time":1},{}]
]