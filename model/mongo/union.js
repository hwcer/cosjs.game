//公会，战盟
"use strict"
const dbase = require("../dbase");
class union extends dbase.mongo{
    constructor(sid){
        super(sid,'union');
    }
}
module.exports = function(sid){
    return new union(sid);
}


