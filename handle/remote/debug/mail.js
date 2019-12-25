"use strict";
/**
 * @name mail
 * 添加邮件
 */


/**
 * @name add
 * @param string title 邮件标题
 * @param string content 邮件内容
 * @param string attr 道具(1):type,id,num,type,id,num
 * 添加邮件
 * "1":{'name': '道具',  'key':'item'},
 * "2":{'name': '英雄',  'key':'hero'},
 * "5":{'name': '装备',  'key':'equip'},
 */

exports.add = function () {
    let title = this.get("title","string");
    let content = this.get("content","string");
    let attr = this.get("attr","string");
    if(!title || !content){
        return this.error("args empty");
    }
    let mail = this.model.mongo('mail',this.sid);
    let data = {"title":title,"content":content};
    if(attr && attr.indexOf(',') > 0){
        data['attr'] = attr;
    }
    return mail.add(this.uid,data)
}

/**
 * @name sys
 * @param int id 邮件ID
 * @param string args 参数，请按系统邮件需要填写，“,”分割
 * @param string attr 道具(1):type,id,num,type,id,num
 * 添加系统邮件
 */

exports.sys = function () {
    let id = this.get("id","int");
    let attr = this.get("attr","string");
    let args = this.get("args","string");
    if(!id ){
        return this.error("args empty");
    }
    let config = this.config("mail",id);
    if(!config){
        return this.error("config_not_exist")
    }
    let mail = this.model.mongo('mail',this.sid);
    let data = {};
    if(attr && attr.indexOf(',') > 0){
        data['attr'] = attr;
    }
    let arr = [this.uid,id,data];
    if(args){
        arr = arr.concat(args.split(","));
    }
    return mail.sys.apply(mail,arr);
}