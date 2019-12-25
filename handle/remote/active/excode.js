"use strict";
/**
 * @name excode
 * 兑换码
 **/


/**
 * @name /
 * @param string key 兑换码
 * 使用兑换码
 **/
module.exports = function(){
    let id,ik = 0,key = this.get('key','string');
    if(!key){
        return this.error('key empty');
    }
    key = key.trim();
    let api = '/excode/config',data = {"id":key}
    return this.library('spirit/gzone',api,data).then(ret=>{
        if( !ret ){
            return this.error("excode_config_empty",key);
        }
        id = ret["_id"];
        this.updater.active.key(id);  //shop/filter 中会执行一次this.updater.data()
        return this.library.call(this.updater,'shop/filter',ret);
    }).then(config=>{
        let val = this.updater.active.get(id,ik);
        if(config['repeat'] > 0 && val >= config['repeat'] ){
            return this.error('excode_repeat_limit',config['_id'],val,config['repeat']);
        }
        //加道具
        this.library.call(this,'shop/parse',config["item"]);
        this.updater.active.add(id,ik,1,config['ETime'] );
        return this.updater.save();
    }).then(ret=>{
        let api = '/excode/submit';
        let data = {"key":key,"uid":this.uid}
        return this.library('spirit/gzone',api,data);
    })
};
