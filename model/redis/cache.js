const dbase = require("../dbase")

module.exports = function(sid,name,format){
    return new dbase.cache(sid,name,format);
}