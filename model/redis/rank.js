//排行榜
"use strict"
const mvc          = require('cosjs.mvc');
const dbase        = require("../dbase");
const gzone        = mvc.config.get("gzone");

module.exports = function(sid,name){
    return new dbase.rank(gzone ? sid : 0,name);
};