"use strict";
/**
 * @name create
 * 创建角色
 */
const mvc = require("cosjs.mvc");
/**
 * @name /
 * @param string name 用户名（游戏昵称）
 * 创建新角色
 */
module.exports = function register() {
    let name = this.get('name','string');
    let guid = this.session.get('guid');
    if(!guid){
        return this.error('guid empty');
    }
    let role = this.model.mongo('role',this.sid);
    let usrData = {"sid":this.sid,"guid":guid,"name":name};

    return Promise.resolve().then(()=>{
        return this.library('guid/unique',role,name);
    }).then((ret)=>{
        if(ret){
            this.roleNameLocks = ret;
        }
        //验证角色数量
        let role_limit = this.config.get('role.limit');
        if(!role_limit){
            return 0;
        }
        return role.findFromGuid(guid,'name').then(ret=>{
            if( ret && ret.length >= role_limit ){
                return this.error('register_rnum_limit',ret.length , role_limit);
            }
        })
    }).then(()=>{
        return this.library('guid/uid',this.sid);
    }).then(uid=>{
        let time = Date.now();
        this.uid = uid;
        usrData['_id'] = uid;
        usrData['time'] = time;
        usrData['login'] = 0;
        //自定义字段
        let register = this.config.get('role.register');
        if(Array.isArray(register)){
            for(let opt of register){
                usrData[opt['key']] = this.get(opt['key'],opt['type']);
            }
        }
        mvc.format('role',usrData,true);
        return role.insert(usrData,{'j':true})
    }) .then(ret=>{
        //初始道具
        this.updater.role.set("install",1);
        let install = this.config("register")||{};
        for(let k in install){
            this.updater.add(install[k]["id"],install[k]["val"]);
        }
        return this.updater.save();
    }).then(()=>{
        if(this.roleNameLocks) {
            this.roleNameLocks.clear();
        }
        this.updater._update_cache = [];
        return Object.from(usrData,['_id',"name","lv","time"] );
    }).catch(err=>{
        if(this.roleNameLocks) {
            this.roleNameLocks.clear();
        }
        return Promise.reject(err);
    })
};

/**
 * @name verify
 * @param string name 用户名（游戏昵称）
 * 检查名字是否合法
 */

module.exports.verify = function verify() {
    let name = this.get('name','string');
    if(!this.library("/guid/verify",name)){
        return this.error('register_name_verify','name cannot begin with numbers');
    }
    let query = {"name":name}
    let role = this.model.mongo('role',this.sid);
    return role.count(query);
}