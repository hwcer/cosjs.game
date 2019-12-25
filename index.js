"use strict";

const mvc        = require('cosjs.mvc');
const path       = require('path');
const cosjs      = require('cosjs');
const monitor    = require('cosjs.monitor');
const setting    = require("./config");

const dbsType = {"cache":"redis","redis":"redis","mongodb":"mongodb"};
//============================启动进程=================================//
//系统配置，二合一
let root = path.dirname(process.argv[1]);
let file = path.resolve(root, process.argv[2]||'config');
let config = require(file);
let options = Object.assign({},setting);

//合并应用配置
for(let k in config){
    if(typeof config[k] === 'object' && !Array.isArray(config[k]) ){
        options[k] = Object.assign(options[k]||{},config[k]||{});
    }
    else{
        options[k] = config[k];
    }
}

process.env.NODE_ENV = options.debug ? 'development' : 'production';
mvc.config.set(options);
mvc.config.set('root',root);
//英雄使用碎片模式
mvc.config.set('hero.soul',1);
//物品组背包ID
mvc.config.set('igroup.bag',80);
//初始化命名空间
mvc.model.namespace("redis","mongo");
mvc.handle.namespace("local","remote");
//启动入口
exports.start = function(){
    //检查长连接
    if(options['socket'] && !options['socket']['port'] ) {
        options["remote"]['fnum'] = 1;
    }
    //检查内部服务
    if(options['spirit']) {
        options["local"]['fnum'] = 1;
    }
    //加载HTTP本地服务
    cosjs.http(options["local"]);
    //加载HTTP远程服务
    cosjs.http(options["remote"]);
    //加载定时器进程
    cosjs.fork('timer',setting["root"]+'/process/timer');
    //加载长连接进程
    if(options['socket'] && options['socket']['port'] ) {
        if(!Array.isArray(options['socket']['port'])){
            options['socket']['port'] = [options['socket']['port']];
        }
        for(let P of options['socket']['port']){
            cosjs.fork('socket',options['socket']['shell'],P);
        }
    }
    //启动所有服务器
    return cosjs.start(server_start);
}

//脚本模式调试
exports.debug = function(){
    return server_start('debug');
}

//开服入口，node,file,config,sid
exports.install = function(){
    let sid = process.argv[3];
    return server_start('install').then(()=>{
        return require('./install')(sid);
    }).then(()=>{
        console.log("app install success");
        process.exit();
    }).catch(err=>{
        console.log('app install fail:',err)
        process.exit();
    })
}


//启动进程时
function server_start(name){
    return Promise.resolve().then(()=>{
        return mvc.addPath(setting["root"]);  //初始化框架路径
    }).then(()=>{
        return mvc.addPath(options["root"]);   //初始化项目路径
    }).then(()=>{
        let spirit = mvc.config.get("spirit");
        if(spirit){
            return monitor.plugin({"prefix":"ssid","secret":mvc.config.get("app.secret") });
        }
    }).then(()=>{
        return pool_connect(name,0);
    }).then(()=>{
        let multi = mvc.library("multi",options.sid,pool_connect.bind(this,name));
        return multi.start();
    }).then(()=>{
        //初始化updater
        let iTypes = mvc.config("iTypes");
        require('cosjs.updater').initialize(iTypes,2);
    })
}


//连接数据库池

function pool_connect(name,sid){
    let nodbworker =['timer','spirit','socket'];

    if(nodbworker.indexOf(name) >= 0){
        return Promise.resolve(1);
    }

    let opt,dbs = options.dbs[sid]||0;
    if(typeof dbs === 'number'){
        opt = {"cache":dbs,"redis":dbs,"mongodb":dbs}
    }
    else{
        opt = dbs;
    }
    let worker = db_connect.bind(null,opt,sid);
    let multi = mvc.library("multi",dbsType,worker);
    return multi.start();
}


function db_connect(opt,sid,k){
    let v = opt[k];
    let pk = [k , sid].join("");
    let ty = typeof v;
    if (ty === 'number') {
        let tk = [k , v].join("")
        return cosjs.pool.link(pk, tk);
    }
    else if(ty === 'string' && v.indexOf(k)===0 ){
        return cosjs.pool.link(pk, v);
    }
    else{
        let dbkey = dbsType[k];
        return cosjs.pool[dbkey](pk, v);
    }
}