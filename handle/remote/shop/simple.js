"use strict";
/**
 * @name simple
 * 快速购买
 */

/**
 * @name /
 * @param int id 道具ID
 * @param int num 购买数量
 * 快速购买
 */
module.exports = function(){
    let id = this.get('id','int');
    let num = this.get('num','int');
    if( !id || !num ){
        return this.error("args error");
    }
    let shopSimple = this.config("shopSimple",id)
    if(!shopSimple){
        return this.error("config_not_exist",["shopSimple",id]);
    }

    this.updater.add(id,num * shopSimple['num']);

    for(let sub of shopSimple["sub"]){
        this.updater.sub(sub["id"],sub["num"] * num);
    }

    return this.updater.save();
}