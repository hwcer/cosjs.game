
"use strict";
/**
 * @name mail
 * 邮件管理
 */
/**
 * @name getter
 * @param int time 客户端最后更新时间
 * 邮件列表
 */
exports.getter = function(){
    let time = this.get("time","int") ||0;
    let keys = [];
    let mail = this.model.mongo('mail',this.sid);
    return mail.mget(this.uid,keys,time);
}



/**
 * @name read
 * @param string id 邮件ID
 * 设置已读
 * 多个邮件以","分割
 * ID为空一键领取邮件
 */
exports.read = function () {
    let id = this.get('id', 'string');
    let mail = this.model.mongo('mail',this.sid);
    let query = {"uid":this.uid,"status":0,"time":{"$lt":this.updater.time} };
    if(id){
        query["_id"] = {"$in":id.split(",") };
    }
    let keys = ['status','attr'];
    let option = {"multi":true,"dataType":"array","fields":mail.fields(keys) };
    let commMail = [],attrMail = [];
    return mail.find(query,option).then(ret=>{
        if(!ret || ret.length < 1){
            return this.success(0);
        }
        for(let d of ret){
            let arr = String(d['attr']).split(',');
            if(arr.length >= 3){
                attrMail.push(d['_id']);
            }
            else {
                commMail.push(d['_id']);
            }
        }
    }).then(()=>{
        if(commMail.length > 0 ){
            return mail.set(commMail,'status',2);
        }
    }).then(()=>{
        if(attrMail.length > 0 ){
            return mail.set(attrMail,'status',1);
        }
    }).then(()=>{
        return attrMail.length + commMail.length;
    })
}

/**
 * @name remove
 * @param string id 邮件ID
 * 删除邮件
 * 多个邮件以","分割
 * ID为空删除所有已读(附件已经领取)邮件
 */
exports.remove = function () {
    let id = this.get("id","string");
    let mail = this.model.mongo('mail',this.sid);
    let query = {"uid":this.uid,"time":{"$lt":this.updater.time} };
    if(id.indexOf(',') > 0){
        query['_id'] = {"$in":id.split(",")};
    }
    else if(id){
        query['_id'] = id.trim();
    }

    let remove = this.config.get("mail.remove")||0;
    if(remove>0){
        query['status'] = {"$gte":2};
        return mail.remove(query);
    }
    else {
        query['status'] = 2;
        return mail.set(query,"status",9);
    }
}



/**
 * @name submit
 * @param string id 邮件ID
 * 领取附件
 * 多个邮件以","分割
 * ID为空一键领取邮件
 */
exports.submit = function () {
    let id = this.get('id', 'string');
    let mail = this.model.mongo('mail',this.sid);
    let query = {"uid":this.uid,"status":{"$lt":2},"time":{"$lt":this.updater.time} };
    if(id){
        query["_id"] = {"$in":id.split(",") };
    }
    let keys = ['status','attr'];
    let option = {"multi":true,"dataType":"array","fields":mail.fields(keys) };
    return mail.find(query,option).then(ret=>{
        if(!ret || ret.length < 1){
            return this.success(0);
        }
        for(let row of ret){
            this.library.call(this,'shop/parse',row['attr']);
        }
        let status = Math.max(2,this.config.get('mail.submit')||0 );
        let remove = this.config.get("mail.remove")||0;
        if( status >=9 && remove ){
            return mail.remove(query,{"multi":true});
        }
        else{
            return mail.set(query,"status",status);
        }
    }).then(()=>{
        return this.updater.save();
    })
}
