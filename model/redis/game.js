//服务器基本信息,uid,item id 生成器
"use strict"
const mvc          = require('cosjs.mvc');
const dbase        = require("../dbase");
const gzone        = mvc.config.get("gzone");


module.exports = function(sid){
    return new dbase.redis(gzone ? sid : 0,'game','game');
}