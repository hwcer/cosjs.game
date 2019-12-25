"use strict";
const mvc = require("cosjs.mvc");
const promise = mvc.library.require("promise");
//this=updater;
module.exports = function(tar,key,STime,ETime){
    let Pv;
    if(tar===1){  //玩家数据
        Pv = this.role.model.get(this.uid,key );
    }
    else if(tar==2){ //成就
        Pv = this.record.model.get(key,'val');
    }
    else if(tar===10){//每日数据
        Pv = this.daily.model.get(key);
    }
    else if(tar===20){//每周数据，本周
        Pv = this.daily.model.week(key);
    }
    else if(tar===100){//活动期间日常数据累计
        Pv = this.daily.model.sum(STime,ETime,key);
    }
    else{//0：固定为1，不需要条件，其他（无法识别）固定为0，无法完成
        Pv = Promise.resolve(tar ? 0 : 1);
    }
    return Pv.then(ret=>{
        let val;
        if(typeof ret === 'number'){
            val = ret;
        }
        else{
            val = obj_getter_val(ret,key);
        }
        return val;
    })
};


function obj_getter_val(val,key){
    if(!val || typeof val !== 'object'){
        return 0;
    }
    if(String(key).indexOf(".") < 0){
        return val[key]||0
    }
    let d = obj_select_key(val,key);
    if(!d){
        return 0;
    }
    let k = d["key"];
    return d["val"][k]||0;
}



function obj_select_key(value,key){
    let result = {"key":key,"val":value};
    if( key.indexOf(".") > 0 ){
        let arr  = key.split(".");
        result["key"] = arr.pop();
        for(let k of arr){
            if(!(k in result["val"])){
                result["val"][k] = {};
            }
            if(!result["val"][k] || typeof result["val"][k] !== 'object'){
                return false;
            }
            result["val"] = result["val"][k];
        }
    }
    if(arguments.length>2 && !(result["key"] in result["val"] )){
        result["val"][result["key"]] = arguments[2];
    }
    return result;
}