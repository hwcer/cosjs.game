"use strict";
/**
 * @name select
 * 选择角色
 */

/**
 * @name /
 * @param string uid 角色ID
 * 选择角色
 */
module.exports = function() {
    let uid = this.get('uid');
    if (!uid) {
        return this.error('uid empty');
    }
    let role = this.model.mongo('role',this.sid,uid);
    let usrData,lastTime;
    return role.get().then(ret=>{
        if(!ret){
            return this.error('role['+uid+'] not exist');
        }
        usrData = ret;
        let sdata = {"uid":uid,"name":usrData['name'],"lv":usrData['lv']||1,"vip":usrData['vip']||0,"time":usrData['time']||0}
        this.session.set(sdata);
    }).then(()=>{
        //每日登陆
        lastTime = usrData['login'] || 0;
        let todayTime = this.library("time/today");
        usrData['login'] = Date.now();

        if( lastTime >= todayTime){
            return usrData;
        }
        //============================日常数据==================================
        let sumlog = usrData['sumlog'] || 0;
        let conlog = usrData['conlog'] || 0;
        usrData['sumlog'] = sumlog + 1;
        let yesterday = todayTime - 86400 * 1000;
        if(lastTime >= yesterday){
            usrData['conlog'] = conlog + 1;
        }
        else{
            usrData['conlog'] = 1;
        }
        //this.log('login',update.uid,update.get('time'),lastTime );
        let daily = this.model.mongo('daily',this.sid,this.uid);
        return daily.set(uid,"login",1);
    }).then(()=>{
        let upsert = {};
        upsert['login'] = usrData.login;
        upsert['sumlog'] = usrData.sumlog;
        upsert['conlog'] = usrData.conlog;
        return role.set(upsert);
    }).then(()=>{
        //DAU统计
        let appid = this.config.get("app.id");
        let query = {"sid":this.sid,"time":usrData['time'],"last":lastTime}
        this.library("spirit/gzone",'/count/login/',appid,this.sid,query).catch(err=>{
            console.log("spirit/gzone","/count/login/",err)
        })
        return usrData
    });
};