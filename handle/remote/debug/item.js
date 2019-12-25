"use strict";
/**
 * @name item
 * 道具发放
 */


/**
 * @name add
 * @param int id 道具ID
 * @param int num 数量
 * 添加道具
 */

exports.add = function () {
    let id = this.get("id","int"),num = this.get("num","int");
    if(!id || !num){
        return this.error("args empty")
    }
    this.updater.add(id,num);
    return this.updater.save();
}