"use strict";
/**
 * @name carnival
 * 开服嘉年华
 * config-base.carnival = 14;
 */
const activeid = 'carnival';
/**
 * @name submit
 * @param int id 任务ID
 * 兑换奖励
 */
exports.submit = function(){
    let id = this.get('id','int');
    if(!id ){
        return this.error("args empty");
    }
    let config = this.config("carnivalTask",id);
    if(!config){
        return this.error("config_not_exist","carnivalTask",id);
    }
    let days = parseInt(this.config("base","carnival"));
    if(days < 1){
        return this.error("carnival disable");
    }


    let regTime = this.session.get("time")||0;
    let endTime = this.library("time/expire",regTime,days);
    let nowTime = Date.now();
    if(endTime < nowTime){
        return this.error("carnival finish")
    }
    this.updater.active.key(activeid);
    this.updater.active.fieids(0,id);
    this.updater.item.group(config['item']);

    return this.updater.data().then(()=>{
        let log = this.updater.active.get(activeid,id)||0;
        if(log){
            return this.error("carnival log exist",id);
        }
    }).then(()=>{
        return this.library.call(this.updater,'values',config['tar'],config['key'],regTime,endTime);
    }).then(val=>{
        if(val < config['val']){
            return this.error("carnival val limit",val , config['val']);
        }
        this.updater.active.add(activeid,0,1,endTime);
        this.updater.active.add(activeid,id,1,endTime);
        return  this.updater.save();
    })
}


/**
 * @name reward
 * @param int id 任务ID
 * 领取总奖励
 */
exports.reward = function(){
    let id = this.get('id','int');
    if(!id ){
        return this.error("args empty");
    }
    let config = this.config("carnivalStep",id);
    if(!config){
        return this.error("config_not_exist","carnivalStep",id);
    }
    let days = parseInt(this.config("base","carnival"));
    if(days < 1){
        return this.error("carnival disable");
    }


    let regTime = this.session.get("time")||0;
    let endTime = this.library("time/expire",regTime,days);
    let nowTime = Date.now();
    if(endTime < nowTime){
        return this.error("carnival finish")
    }
    this.updater.active.key(activeid);
    this.updater.item.group(config['item']);
    return this.updater.data().then(()=>{
        let log = this.updater.active.get(activeid,id)||0;
        if(log){
            return this.error("carnival log exist",id);
        }
        let val = this.updater.active.get(activeid,0)||0;
        if(val < id){
            return this.error("carnival val limit",val , id);
        }
        this.updater.active.add(activeid,id,1,endTime);
        return this.updater.save();
    })
}

