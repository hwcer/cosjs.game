"use strict";
/**
 * @name supmail
 * 超级邮件
 */


/**
 * @name submit
 * @param string id 邮件ID
 * 领取附件
 */
exports.submit = function (){
    let ik = 0,id = this.get('id');
    if ( !id ) {
        return this.error('args empty');
    }
    let api = '/active/',data = {"id":id,"keys":"item"} ;
    return this.library('spirit/gzone',api,data).then(ret=>{
        if( !ret ){
            return this.error("supmail_config_empty",id)
        }
        this.updater.active.key(id);  //shop/filter 中会执行一次this.updater.data()
        return this.library.call(this.updater,'shop/filter',ret);
    }).then(config=>{
        let val = this.updater.active.get(id,0)||0;
        if(val > 0){
            return this.error("supmail_submit_exist",id);
        }
        //加道具
        this.library.call(this,'shop/parse',config["item"]);
        //写记录
        let status = this.config.get('mail.submit')||0;
        this.updater.active.set(id,ik,Math.max(2,status),config['ETime']||0);
        return this.updater.save();
    })
}



/**
 * @name remove
 * @param string id 邮件ID
 * 删除邮件
 */
exports.remove = function (){
    let ik = 0,id = this.get('id');
    if ( !id ) {
        return this.error('args empty');
    }
    let api = '/active/',data = {"id":id} ;
    return this.library('spirit/gzone',api,data).then(ret=>{
        if( !ret ){
            return this.error("supmail_config_empty",id)
        }
        this.updater.active.key(id);  //shop/filter 中会执行一次this.updater.data()
        return this.library.call(this.updater,'shop/filter',ret);
    }).then(config=>{
        let val = this.updater.active.get(id,0)||0;
        if(val >=9){
            return this.success(1);
        }
        let arr = String(config["item"]).split(',');
        if(arr.length >=3 && val < 1 ){
            return this.error("supmail_remove_disable",id)
        }
        //写记录
        this.updater.active.set(id,ik,9,config['ETime']||0);
        return this.updater.save();
    })
}