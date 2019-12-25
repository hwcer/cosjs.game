"use strict";
/**
 * @name role
 * 玩家列表
 */

/**
 * @name simple
 * @param string uid 玩家唯一标识,多个以","分割
 * @param string key 额外字段,多个以","分割
 * 玩家简单列表
 */
exports.simple = function(){
    let uid = this.get('uid');
    let key = this.get('key','string')||'';
    if(!uid){
        return this.error('error','uid empty');
    }
    let arr_uid = uid.split(',').filter(u => u.length >0);
    if(arr_uid.length < 1){
        return this.error("uid empty")
    }

    let fk = ['_id','lv','icon',"name"];

    let arr_key = key.split(",");
    for(let k of arr_key){
        if(k) fk.push(k);
    }

    let role = this.model.mongo('role',this.sid);
    return role.get(arr_uid,fk);
};