//动态商城
"use strict"
const dbase = require("../dbase")

module.exports = function(sid){
    return new dbase.cache(sid,'shop','int');
}