//http启动脚本
"use strict";
const mvc      = require('cosjs.mvc');
const cosjs     = require('cosjs');
const body     = require('body-parser');
const monitor  = require('cosjs.monitor');

module.exports = function(){
    let app = this;
    app.defineHandlePrototype("model",mvc.model);
    app.defineHandlePrototype("config",mvc.config);
    app.defineHandlePrototype("library",mvc.library);

    let jsonencoded = body.json({extended: true,limit:"100kb" });
    //内部服务器
    //let local_root = setting["root"] + '/handle/local';
    let local_route = {route:"/s:sid/*",method:'all',output:'json',"subpath":local_handle_subpath}
    let local_server = app.server(mvc.handle.local(),local_route,jsonencoded);
    local_server.on('start',local_handle_start);

    /////////////////////监控服务//////////////////////
    let spirit = mvc.config.get("spirit");
    if(spirit){
        let update = spirit.update;
        update.sid  = mvc.config.get('sid');
        update.port  = mvc.config.get('local.port');
        spirit.group = mvc.config.get('app.id');
        monitor.spirit(spirit);
    }
    //初始化SESSION配置，万一要用呢？
    let local_session = {"redis":local_session_redis,"level":-1,"method":"all"};
    let config_session = mvc.config.get("session")||{};
    local_server.session = Object.assign({},local_session,config_session);

    //404错误
    app.use('*',function ( req, res, next) {
        res.status(404).json(404);
    })
}

function local_handle_subpath(){
    this.sid = parseInt(this.req.params["sid"])||0;
    return this.req.params[0];
}
//本地验证
function local_handle_start(){
    let sid = mvc.config.get('sid');
    if( !this.sid || sid.indexOf(this.sid) < 0  ){
        return this.error("server_id_error",`game[${this.sid}] not in this server`);
    }

    let debug = this.config.get('debug');
    if(debug >=2){
        return true;
    }
    let secret = mvc.config.get("app.secret");
    let {err,ret} = mvc.library.call(this,'sign/verify',this.req.body,secret);
    if(err){
        return this.error(err,ret);
    }
}

function local_session_redis(){
    let sid = this.sid;
    let key = ["cache",sid].join("");
    let redis = cosjs.pool.get(key);
    if(!redis){
        throw new Error(`session redis[${key}] empty`)
    }
    return redis;
}