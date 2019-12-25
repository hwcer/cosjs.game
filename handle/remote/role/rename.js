"use strict";
/**
 * @name rename
 * 角色改名
 */



/**
 * @name /
 * @param string name 新角色名
 * 角色改名
 */

module.exports = function() {
    let name = this.get('name','string');

    let sub= this.config.get("role.rename");
    if(!sub || typeof sub !== 'object'){
        return this.error("rename is forbidden")
    }

    return Promise.resolve().then(()=>{
        return this.library('guid/unique',this.updater.role.model,name);
    }).then((ret)=>{
        if(ret){
            this.roleNameLocks = ret;
        }
        this.updater.sub(sub);
        this.updater.role.set('name',name);
        return this.updater.save();
    }).then(()=>{
        if(this.roleNameLocks) {
            this.roleNameLocks.clear();
        }
        return 'ok';
    }).catch(err=>{
        if(this.roleNameLocks) {
            this.roleNameLocks.clear();
        }
        return Promise.reject(err);
    })

};