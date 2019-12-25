"use strict";
/**
 * @name basics
 * 运营活动
 */

/**
 * @name submit
 * @param string id 活动ID
 * @param int ik 奖励编号
 * 兑换奖励
 */
exports.submit = function (){
    let id = this.get('id'), ik = this.get('ik','int');

    if ( !id || !ik) {
        return this.error('args empty');
    }
    let api = '/active/',data = {"id":id,"ik":ik};
    return this.library('spirit/gzone',api,data).then(ret=>{
        if( !ret || !ret["item"] || !ret["item"][ik]){
            return this.error("active_ik_empty",id,ik)
        }
        this.updater.active.key(id);  //shop/filter 中会执行一次this.updater.data()
        this.updater.active.fieids(ik);
        return this.library.call(this.updater,'shop/filter',ret);
    }).then(config=>{
        let val = this.updater.active.get(id,ik)||0;
        if(config["item"][ik]['max'] > 0 && val >= config["item"][ik]['max'] ){
            return this.error('active_max_limit',val,config["item"][ik]['max']);
        }
        if(config["item"][ik]['dt'] > 0 ){
            return verify_active_value.call(this,ik,config);
        }
        else {
            return config;
        }
    }).then(config=>{
        //扣道具
        if(config["item"][ik]['sub']){
            this.library.call(this,'shop/parse',config["item"][ik]['sub'],1);
        }
        //加道具
        if(config["item"][ik]['add']){
            this.library.call(this,'shop/parse',config["item"][ik]['add']);
        }
        //写记录
        this.updater.active.add(id,ik,1,config['ETime']);
        return this.updater.save();
    })
}

function verify_active_value(ik,config){
    let item = config["item"][ik];
    if(!item['dk']){
        return this.error("active_dk_empty")
    }
    let tar = parseInt(item['dt']) , key = item['dk'];

    return this.library.call(this.updater,"values",tar,key,config['STime'],config['ETime']).then(val=>{
        if(val <= 0){
            return this.error('active_val_limit',item['dc'],0,tar);
        }
        if(item['dc']===0 && val < item['val'] ){
            return this.error('active_val_limit',item['dc'],val,item['val']);
        }
        if(item['dc']>0 && val > item['val'] ){
            return this.error('active_val_limit',item['dc'],val,item['val']);
        }
        return config;
    })
}

