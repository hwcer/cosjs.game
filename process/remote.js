//http启动脚本
"use strict";
const mvc       = require('cosjs.mvc');
const body      = require('body-parser');
const cosjs     = require('cosjs');
const express   = require('express');
const updater   = require('cosjs.updater');

const session_format = {
    "lv":{"type":"int","val":0},
    "vip":{"type":"int","val":0},
    "sid":{"type":"int","val":0},
    "uid":{"type":"string","val":""},
    "guid":{"type":"string","val":""},
    "name":{"type":"string","val":""},
    "time":{"type":"int","val":0},
    "repeat":{"type":"array","val":[]},  //最近请求ID
}

module.exports = function(){
    let app = this;
    //let root = mvc.config.get("root");
    //var pool = cosjs.pool;
    app.defineHandlePrototype("model",mvc.model);
    app.defineHandlePrototype("config",mvc.config);
    //apps.defineHandlePrototype("format",mvc.format);
    app.defineHandlePrototype("library",mvc.library);

    let urlencoded = body.urlencoded({ extended: true,limit:"100kb" });
    let jsonencoded = body.json({extended: true,limit:"100kb" });

    /////////////////////远程跨域//////////////////////
    let Access_Control_Allow_Origin  = mvc.config.get("Access_Control_Allow_Origin")||"*";
    app.use(function (req,res,next) {  res.set("Access-Control-Allow-Origin",Access_Control_Allow_Origin); next();})

    /////////////////////ping//////////////////////
    app.use('/ping',function (req,res,next) {
        res.end(String(Date.now()));
    })

    /////////////////////远程服务//////////////////////
    let remote_method = "all";
    let remote_route = {"route":"/s:sid/*","method":remote_method,"output":'json',"subpath":remote_handle_subpath};
    let remote_server = app.server(mvc.handle.remote(),remote_route,urlencoded,jsonencoded);
    let remote_session = {"redis":remote_session_redis,"level":remote_session_level,"method":remote_method,"format":session_format };
    let config_session = mvc.config.get("session")||{};

    remote_server.on('start',remote_handle_start);
    remote_server.on('finish', remote_handle_finish);
    remote_server.session = Object.assign({},remote_session,config_session);
    //判断是否同进程启动SOCKET
    let socket = mvc.config.get("socket");
    if(socket && socket['shell'] && !socket['port']){
        let http = arguments[arguments.length - 1];
        require(socket['shell'])(http);
    }

    //是否启用静态文件服务器
    let wwwroot = mvc.config.get("wwwroot");
    if(wwwroot){
        app.use(express.static(wwwroot));
    }

    //基础配置
    mvc.config.set("handle.level",{'/login/':0,'/login/debug':0})
    //404错误
    app.use('*',function ( req, res, next) {
        res.status(404).json(404);
    })
};



function remote_handle_subpath(){
    this.sid = parseInt(this.req.params["sid"])||0;
    return this.req.params[0];
}

function remote_session_redis(){
    let sid = this.sid;
    let key = ["cache",sid].join("");
    let redis = cosjs.pool.get(key);
    if(!redis){
        throw new Error(`session redis[${key}] empty`)
    }
    return redis;
}

function remote_session_level(){
    let level = mvc.config.get('handle.level');
    if(level.hasOwnProperty(this.path)){
        return level[this.path];
    }
    else if( this.path.indexOf('get') >=0){
        return 1;
    }
    else{
        return 3;
    }
}

function remote_handle_start(){
    let sid = mvc.config.get('sid');
    if( !this.sid || sid.indexOf(this.sid) < 0  ){
        return this.error("server_id_error",`game[${this.sid}] not in this server`);
    }
    //屏蔽DEBUG目录
    let debug = mvc.config.get('debug');
    if(debug < 1 && this.path.indexOf('debug')>=0 ) {
        return this.error("debug", "debug disable");
    }
    //安全验证
    let verify = mvc.config.get("verify")||{};
    //防止重发
    if(verify['repeat']){
        let rid = this.get(verify['repeat'],'int');
        let repeat = this.session.get("repeat")||[];
        if(rid && repeat.indexOf(rid) >= 0){
            return this.error("repeat_request",rid);
        }
        repeat.unshift(rid);
        if(repeat.length > 10){
            repeat = repeat.slice(0,10);
        }
        this.session.set("repeat",repeat);
    }
    //超时验证
    if(verify.maxrms > 0) {
        let _verify_time = this.get('_verify_time','int');
        if( !_verify_time ){
            return this.error("verify_time_empty",0);
        }
        let nowTime = Date.now();
        let diffTime = Math.abs( nowTime - _verify_time );
        if( diffTime > verify.maxrms){
            return this.error("verify_time_expire",_verify_time);
        }
    }
    //SIGN验证,_verify_sign
    if(verify.secret) {
        let {err,ret} = mvc.library("sign/verify",this.req.body, verify.secret);
        if(err){
            return this.error(err,ret);
        }
    }
    //检验是否已经选择角色
    if( this.session && this.session.level > 0 ){
        let sid = this.session.get("sid");
        if(sid != this.sid){
            return this.error("logout", "sid empty");
        }
        let arr = ["/role/select/","/role/create/","/role/verify/"];
        if(arr.indexOf(this.path) < 0) {
            let uid = this.session.get("uid");
            if (!uid) {
                return this.error("logout", "session uid empty");
            }
            this.uid = uid;
        }
    }
    //绑定updater
    Object.defineProperty(this, 'updater', { enumerable: true,  configurable: false, get: remote_updater_bind.bind(this)  });
}


function remote_handle_finish(err,ret){
    let data = {err:err,ret:ret,time:Date.now()}
    if( !err && this._handle_updater) {
        data["cache"] = this._handle_updater.cache();
        for(let act of data['cache']){
            let k = act['k'];
            if(act['b']==10 && session_format[k] ){
                this.session.set(k,act['r'])
            }
        }
    }
    return data;
}

function remote_updater_bind(){
    if( !this.uid ){
        return false;
    }
    if(!this._handle_updater){
        this._handle_updater = updater(this.uid,this.sid);
    }
    return this._handle_updater;
}