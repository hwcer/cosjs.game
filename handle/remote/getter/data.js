"use strict";
/**
 * @name data
 * 玩家数据
 */

/**
 * @name role
 * 基本信息
 */
exports.role = function(){
    let role = this.model.mongo('role',this.sid,this.uid);
    return role.get();
};

/**
 * @name item
 * @param int bag 背包ID，留空获取所有
 * 道具列表
 */

exports.item = function(){
    let bag = this.get("bag","int");
    let model = this.model.mongo("item",this.sid,this.uid);
    return model.mget(bag);
}

/**
 * @name daily
 * 日常数据
 */

exports.daily = function(){
    let days = this.config('base','dataMaxDay')||15;
    let STime = Date.now() - days * 86400 * 1000;
    let daily = this.model.mongo("daily",this.sid,this.uid)
    return daily.mget(STime)
}

/**
 * @name active
 * 活动数据
 */
exports.active = function(){
    let active = this.model.mongo("active",this.sid,this.uid)
    return active.mget();
}



