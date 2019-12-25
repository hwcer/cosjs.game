"use strict"
const cosjs_session = require("cosjs.session");
//验证SOCKET登录
exports.online = function(){
    return Promise.resolve().then(ret=>{
        let debug = this.config.get("debug")
        if(debug){
            return this.get("uid");
        }
        let access = this.get("access",'string');
        if(!access){
            return this.error("access empty");
        }
        return this.session.start(access).then(()=>{
            return this.session.get("uid");
        });

    }).then(uid=>{
        if(!uid){
            return this.error(`role[${uid}] not exist`)
        }
        this.uid = uid;
        let role = this.model.mongo('role',this.sid,uid);
        let fields = this.config.get("socket.fields")||["sid","name"];
        if(fields.indexOf('sid') < 0){
            fields.push('sid');
        }
        return role.get(fields);
    }).then(ret=>{
        if(!ret){
            return this.error('user not exist')
        }
        //this.session.set("socket",this.get("ename")||'' );
        ret['uid'] = this.uid;
        delete ret['_id'];
        return ret;
    })
}


exports.offline = function(){
    let uid = this.get("uid",'string');
    if(!uid){
        return this.error('uid empty');
    }
    this.session.uid = uid;
    this.session.level = 0;
    return this.session.start().then(()=>{
        return this.session.del('socket')
    });
}