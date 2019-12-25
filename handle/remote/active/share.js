"use strict";
/**
 * @name share
 * 广告分享
 */

/**
 * @name /
 * @param int id 广告ID
 * 兑换奖励
 */
module.exports = function (){
    let id = this.get('id','int');
    let config = this.config("share",id);
    if(!config){
        return this.error("config_not_exist","share",id);
    }
    let key = ['share',id].join(".");
    this.updater.daily.add(key,1);
    for(let d of config['item']){
        if(d.id && d.num){
            this.updater.add(d.id,d.num);
        }
    }

    return this.updater.data().then(()=>{
        let shareNum = this.updater.daily.get(key)||0;
        if(shareNum >= config['limit']){
            return this.error("share_num_limit",shareNum , config['limit'] );
        }
        return this.updater.save();
    })

}