"use strict"
const mvc = require('cosjs.mvc');
module.exports = function(){
    let key = this.get("key","string");
    if(!key){
        return this.error("配置类型不能为空");
    }
    let arr = key.split(",");
    let data = {};
    for(let dk of arr) {
        data[dk] = this.config(dk)||null;
    }
    return data;
}


module.exports.format = function(){
    let key = this.get("key","string");
    if(!key){
        return this.error("配置类型不能为空");
    }
    let arr = key.split(",");
    let data = {};
    for(let dk of arr) {
        data[dk] = mvc.format(dk);
    }
    return data;
}