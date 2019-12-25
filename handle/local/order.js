"use strict"
const PAYWEALKEY = 'payweal';
const mongodb = require('mongodb');
const updater = require('cosjs.updater');
//创建验证订单,如果为定时抢购类必须自带config
exports.create = function(){
    let id = this.get("id",'int');
    let uid = this.get("uid",'string');
    let cyt = this.get("cyt",'string');

    if( !id || !uid|| !cyt){
        return this.error("args empty","game/local/order/create")
    }
    let paymentConfig = this.config("payment",id);
    if(!paymentConfig){
        return this.error("config_not_exist","payment",id);
    }

    let paycodeConfig = this.config("paycode",paymentConfig['key'] );
    if(!paycodeConfig){
        return this.error("config_not_exist","paycode",paymentConfig['key'] );
    }

    if(!paycodeConfig.hasOwnProperty(cyt)){
        return this.error("paycode_not_exist",cyt,id );
    }

    this.updater = updater(uid,this.sid);
    this.updater.role.key("sdk","guid","time");

    let orderModel   = this.model.mongo('order',this.sid);
    return Promise.resolve().then(()=>{
        if( !paymentConfig['dnum'] ){
            return;
        }
        //检查每日限购
        let today = this.library("time/today");
        let query = {"uid":uid,"item":id,"time":{"$gte":today} };
        return orderModel.count(query).then(ret=>{
            if(ret >= paymentConfig['dnum']){
                return this.error("payment_dnum_limit",ret ,paymentConfig['dnum']);
            }
        })
    }).then(()=>{
        //检查终身限购
        if( !paymentConfig['tnum'] ){
            return ;
        }
        let query = {"uid":uid,"item":id,"status":{"$gte":8} };
        return orderModel.count(query).then(ret=>{
            if(  ret >= paymentConfig['tnum'] ){
                return this.error(this,'order_tnum_limit',ret,paymentConfig['tnum']);
            }
        })
    }).then(()=>{
        let data = {
            "id":id,
            "cyt" : cyt,
            "guid":this.updater.role.get("guid"),
            "amount": paycodeConfig[cyt],
            "attach":[this.updater.uid,this.updater.sid,id].join("y"),   //透传参数
            "orderid":mongodb.ObjectID().toString(),                    //订单ID
        };
        return data;
    })
}


//充值回调发货
exports.notify = function () {
    //this.debug = 1;
    let id = this.get('id','int');
    let uid = this.get('uid','string');
    let cyt = this.get("cyt",'string');
    let sdk = this.get("sdk",'string');
    let amount = this.get('amount','int');
    let orderid = this.get('orderid','string');

    if( !id || !uid || !cyt || !sdk || !orderid){
        return this.error("args empty","game/local/order/notify")
    }

    let paywealConfig,paymentConfig,paycodeConfig;

    paymentConfig = this.config("payment",id);
    if(!paymentConfig){
        return this.error("config_not_exist","payment",id);
    }

    paycodeConfig = this.config("paycode",paymentConfig['key'] );
    if(!paycodeConfig){
        return this.error("config_not_exist","paycode",paymentConfig['key'] );
    }

    if(!paycodeConfig.hasOwnProperty(cyt)){
        return this.error("paycode_not_exist",cyt,id );
    }


    if(amount && amount != paycodeConfig[cyt]){
        return this.error("payment_amount_error",amount,paycodeConfig[cyt] );
    }


    this.updater = updater(uid,this.sid);
    //this.updater.role.key('zb','rmb','vip','vxp');
    
    let orderModel   = this.model.mongo('order',this.sid);
    let orderRecord  = { "_id":orderid, "sdk" :sdk,"uid" : uid,"cyt":cyt,"val":paycodeConfig[cyt],"item":id,"time" : this.updater.time,"status" :0,"result" : [] };
    
    let locks = this.model.redis("locks",this.sid,'order');
    return locks.start(orderid).then(ret=>{
        if(ret.length > 0){
            return this.error("order_locked",orderid);
        }
        return orderModel.get(orderid,['status','result']);
    }).then(d=>{
        if(d && d['status'] >= 8){
            return this.success(d);  //已经发货，防止重复
        }
        else if(d){
            return this.error('order_status_error',d['status']);
        }
        return orderModel.insert(orderRecord);
    }).then(()=>{
        //首冲奖励判断
        if(!paymentConfig['first']){
            return false;
        }
        let query = {"uid":uid,"item":id,"status":{"$gte":8}};
        return orderModel.count(query).then(ret=>{
            if( paymentConfig['first'] && ret < 1 ){
                return true;
            }
            else{
                return false;
            }
        })
    }).then(first=>{
        //VIP经验 成就，每日充值
        if(paymentConfig["vxp"]){
            let vip = this.config.get("role.vip");
            if(vip) {
                this.updater.role.key('vip');
                this.updater.role.add('vxp', paymentConfig["val"]);
            }
            let rolePayment = this.config.get("role.payment");
            if(rolePayment) {
                this.updater.role.add(rolePayment, paymentConfig["val"]);
                this.updater.daily.add(rolePayment, paymentConfig["val"]);
            }
        }
        //发货
        this.updater.add(paymentConfig['item']);
        //首冲
        if(first){
            this.updater.add(paymentConfig['first']);
        }
        //月卡
        if(paymentConfig["payweal"]){
            paywealConfig = this.config('payweal',paymentConfig["payweal"]);
            if(!paywealConfig){
                return this.error("config_not_exist","paywealConfig",paymentConfig["payweal"]);
            }
            this.updater.active.key(PAYWEALKEY);
        }
        return this.updater.data();
    }).then(()=>{
        if( paywealConfig ){
            let val = this.updater.active.get(PAYWEALKEY,paywealConfig['id'] )||0;
            let stime = Math.max(val,this.updater.time);
            let ttl = this.library("time/expire",stime,paywealConfig['ttl']);
            this.updater.active.set(PAYWEALKEY,paywealConfig['id'],ttl);
        }
        return this.updater.save()
    }).then(r=>{
        //修改订单状态
        let data = {"status":9,"result":this.updater.cache()};
        return orderModel.set(orderid,data).then(()=>data).catch(e=>{
            console.error('orderNotify status save error',JSON.stringify(orderRecord) ,e);
            return this.error('orderNotify status save error',e);
        })
    }).then(data=>{
        data['orderid'] = orderid;
        return data;
    }).finally(()=>{
        if(locks) locks.clear()
    })
}