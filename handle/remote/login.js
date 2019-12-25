"use strict";
/**
 * @name login
 * 用户登录
 */

/**
 * @name /
 * @param string access 认证信息
 * @return string session id
 * 账号登录
 *
 */
module.exports = function () {
    let access = this.get('access');
    if ( !access ) {
        return this.error('access empty');
    }
    return Promise.resolve().then(()=>{
        let api = '/access/';
        let data = { "sid":this.sid,"access":access};
        let appid = this.config.get("app.id");
        return this.library('spirit/gzone',api,appid,this.sid,data);
    }).then(ret=>{
        return create_login_session.call(this,ret);
    })
}


/**
 * @name debug
 * @param string uid 角色uid
 * UID登录,必须DEBUG状态下可用
 */
module.exports.debug = function () {
    let uid = this.get('uid','string');
    if ( !uid ) {
        return this.error('uid empty');
    }
    this.uid = uid;
    this.updater.role.key("guid");
    return Promise.resolve().then(()=>{
        return this.updater.data()
    }).then(()=>{
        let INFO = {};
        INFO['guid'] = this.updater.role.get("guid");
        return create_login_session.call(this,INFO);
    })
}




function create_login_session(INFO) {
    return Promise.resolve().then(()=>{
        if( !INFO || !INFO['guid']){
            return this.error('guid empty:'+JSON.stringify(INFO));
        }
        let loginVerify = this.config.get("login.verify");
        if(typeof loginVerify === 'function'){
            return loginVerify.call(this,INFO);
        }
    }).then(()=>{
        let guid = INFO['guid'];
        let data = {"guid":guid,"sid":this.sid};
        return this.session.create(guid,data);
    }).then(cookie=>{
        this.cookie = cookie;
        let oid = this.session.uid;
        let keys = ['_id','name','lv','time'];
        let role = this.model.mongo('role',this.sid);
        return role.findFromGuid(oid,keys);
    }).then(rows=>{
        let data = {"roles":rows,"cookie":{"key":this.session.opts.key,"val":this.cookie}};
        let loginMessage = this.config.get('login.message');
        if( typeof loginMessage === 'function'){
            return loginMessage.call(this,data);
        }
        else if(loginMessage && typeof loginMessage === 'object'){
            return Object.assign(data,loginMessage);
        }
        else {
            return data;
        }
    })
}