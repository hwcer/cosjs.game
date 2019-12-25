"use strict";
const BASEHEX  = 32;     //最终进制
const mvc = require("cosjs.mvc");
const roleNameReg = /^[\S]{2,30}$/;
//sid前缀,itemid,random
function guid(uid,key){
    if (!(this instanceof guid)) {
        return new guid(uid,key);
    }
    let arr = uid.split('x');
    this.key = key || 'item';
    this.uid = uid;
    this.sid = parseInt(arr[0],BASEHEX);
}

module.exports = guid;
//生成UID
module.exports.uid = function (sid) {
    let key  = arguments[1] || 'uid';
    let game = mvc.model.redis('game',sid);
    return game.incr(key,1).then(ret=>{
        let id = mvc.library("random/Roll",10,32);
        return [sid.toString(BASEHEX),id.toString(BASEHEX),ret.toString(BASEHEX)].join("x");
    })
}
//通过UID,itemid 获取SID
module.exports.sid = function (uid) {
    if(String(uid).indexOf('x') < 0){
        return 0;
    }
    let arr = uid.split("x");
    return parseInt(arr[0],BASEHEX);
}

//无限叠加道具ID，不需要新的随机数
module.exports.item = function(uid,id){
    let arr = uid.split('x');
    arr[1] = id.toString(BASEHEX);
    return arr.join("x")
}

//解析道具ID
//_id => id
module.exports.parse = function(id){
    if(typeof id !== 'string'){
        throw new Error(`guid.parse arguments[${id}] type error`);
    }
    let arr = id.split('x');
    if(arr.length !==3){
        throw new Error(`guid.parse arguments[${id}] format error`);
    }
    return parseInt(arr[1],BASEHEX);
}

//检查名字是否合法
module.exports.verify = function(){
    let id = String(arguments[0]);
    if(!roleNameReg.test(id)){
        return false;
    }
    let arr = id.split('x');
    if(arr.length === 3 && arr[1] == '0' ){
        return false;
    }
    return true;
}

//检验用户名是否唯一
module.exports.unique = function(role,name){
    if(!module.exports.verify(name)){
        return mvc.library('promise/callback','register_name_verify','name format error');
    }
    if(!mvc.config.get('role.unique')){
        return ;
    }
    let gzone = mvc.config.get("gzone");
    let roleNameLocks = mvc.model.redis("locks",gzone ? role.sid : 0,'roleNameLocks');
    return roleNameLocks.start(name).then(ret=>{
        if(ret.length > 0){
            return mvc.library('promise/callback','register_name_exist','user name locked');
        }
    }).then(()=>{
        return role.findFromName(name,'guid').then(ret=>{
            if( ret && ret.length > 0){
                return mvc.library('promise/callback','register_name_exist','user name exist');
            }
        })
    }).then(()=>{
        return roleNameLocks;
    })
}

//获取一个新的道具ID
guid.prototype.get = function(id){
    let arr = Array.isArray(id) ? id : [id];
    let sid = this.sid.toString(BASEHEX);
    return random(this.sid,this.key,arr.length).then(ret=>{
        if(ret.length < arr.length){
            return Promise.reject('guid.get error')
        }
        let ids = [];
        for(let i in arr){
            let k = arr[i],v = ret[i];
            ids.push([sid,k.toString(BASEHEX),v.toString(BASEHEX)].join('x'));
        }
        return ids;
    }).then(ret=>{
        if(Array.isArray(id)){
            return ret;
        }
        else{
            return ret[0];
        }
    })
}
//普通叠加道具
guid.prototype.item = function(id){
    return module.exports.item(this.uid,id);
}
//解析道具配置ID
guid.prototype.parse = function(id){
    return module.exports.parse(id);
}
//验证是不是_id
guid.prototype.verify = function(id){
    return String(id).indexOf('x')>0?true:false;
}
//生成递增的随机数,由updater.item.verify调用
function random(sid,key,num){
    let game = mvc.model.redis('game',sid);
    return game.incr(key,num).then(ret=>{
        let arr = [],min = ret - num + 1;
        for(let i=min;i<=ret;i++){
            arr.push(i);
        }
        return arr;
    });
}

