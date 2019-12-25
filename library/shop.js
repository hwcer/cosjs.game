"use strict";
const mvc = require("cosjs.mvc");
const promise = mvc.library.require("promise");
const DAYMS = 86400 * 1000;

/**
 * @name shop
 * 商城模块
 */

//检查配置
//TType  0-自定义，1-开服时间，2-注册时间
//this=updater
exports.filter = function(opt){
    let sid = this.sid ,
        config = Object.assign({},opt),
        server = mvc.config.get("sid");

    if( server.indexOf(sid) < 0 ){
        return promise.callback("server sid not exist",sid);
    }
    this.role.key("sdk","time");
    return this.data().then(()=>{
        //渠道限制
        if( config['sdk'] ){
            let sdk = this.role.get("sdk")||'';
            if(config['sdk'] !==sdk ){
                return promise.callback('game_limit_limit',sdk,config['sdk'] );
            }
        }
        //服务器限制,清理空配置
        if(config['sid']) {
            let arr = Array.isArray(config['sid']) ? config['sid'] : [config['sid']];
            let sid = new Set(arr);
            sid.delete(0);
            if (sid.size > 0 && !sid.has(this.sid)) {
                return promise.callback('game_sid_limit', config['sid']);
            }
        }
        //开发时间
        if( config['TType'] > 0 ){
            let baseTime = config['TType'] > 1 ? this.role.get("time") : server[sid]['time'];

            let STime = config['STime']||1,ETime = config['ETime']||1;
            let nowtime = mvc.library("time/today",baseTime);
            config['STime'] = nowtime + (STime - 1) * DAYMS;
            config['ETime'] = nowtime + ETime * DAYMS;
        }

        let nowTime = Date.now();
        if( config['STime']>0 && config['STime'] > nowTime ){
            return promise.callback('active_not_start',config['STime']);    //还没上架
        }
        if( config['ETime']>0 && config['ETime'] < nowTime ){
            return promise.callback('config_is_expire', config['ETime']);       //已经下架
        }
        return promise.callback(null,config);
    })
}



//检查限制,this=updater
exports.limit = function(limit){
    for(let opt of limit ){
        if(opt['k']){
            this.role.key(opt['k']);
        }
    }
    return this.data().then(()=>{
        for(let opt of limit ){
            if(opt['k']){
                let n = this.role.get(opt['k'])||0;
                if(!Comparison(n,opt['t'],opt['v'])){
                    return promise.callback("shop_limit",[opt['k'],n,opt['t'],opt['v']] )
                }
            }
        }
        return promise.callback(null,'ok');
    })
}

/*解析字符串型道具列表
item:x,id1,num1,x,id2,num2
必须包含 this.updater
 */
exports.parse = function(item,sub = 0){
    let arr = String(item).split(',');
    if(arr.length < 3){
        return;
    }
    for(let i=0;i < arr.length;i+=3){
        let m = parseInt(arr[i+1]);
        let n = parseInt(arr[i+2]);
        if(sub){
            this.updater.sub(m,n);
        }
        else{
            this.updater.add(m,n);
        }
    }
}


function Comparison(n,t,v){
    if(t<0){
        return n<=v;
    }
    else if(t===0){
        return n == v;
    }
    else{
        return n >= v;
    }
}