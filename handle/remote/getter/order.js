"use strict"

/**
 * @name order
 * 订单管理
 */



/**
 * @name /
 * @param int time 客户端最后更新时间
 * 订单列表
 * 仅列出成功充值列表
 * time：用于客户端增量更新，留空则最近N天记录，N为系统配置天数（base.logMaxNum）
 */
module.exports = function () {
    let time = this.get("time","int")
    if(!time){
        let logMaxNum = this.config("base","logMaxNum") || 7;
        time = this.library("time/today") - (logMaxNum -1)*86400*1000;
    }

    let orderModel = this.model.mongo("order",this.sid);
    return orderModel.mget(this.uid,time);
};



/**
 * @name count
 * @param string id 充值id，不是订单ID
 * @param int STime 开始时间
 * @param int ETime 结束时间
 * 订单统计信息
 * 仅统计成功充值数据
 * id：静态数据[payment.id],留空所有充值，多个以“,”分割
 * STime，ETime 留空，不限制
 */
module.exports.count = function () {
    let id = this.get("id","string"),
        STime = this.get("STime","int"),
        ETime = this.get("ETime","int");
    let keys ;
    if(id){
        keys = [];
        let arr = id.split(",");
        for(let k of arr){
            let v = parseInt(k);
            if(v){
                keys.push(v);
            }
        }
    }
    let orderModel = this.model.mongo("order",this.sid);
    return orderModel.sum(this.uid,keys,STime,ETime);
};



/**
 * @name result
 * @param string orderid 订单ID
 * 充值结果
 */
module.exports.result = function () {
    let orderid = this.get("orderid","string")
    if(!orderid){
        return this.error("orderid emprt")
    }
    let keys = ['status','result'];
    let orderModel = this.model.mongo("order",this.sid);
    return orderModel.get(orderid,keys).then(ret=>{
        if(!ret){
            return this.error("order_not_exist",orderid);
        }
        let result = ret['result'] ||[];
        if(ret['status'] >=8 && result.length >0){
            this.updater._update_cache = result;
        }
        return ret['status'];
    })
};