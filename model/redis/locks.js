const dbase = require("../dbase")


module.exports = function(sid,name,expire){
    return new dbase.locks(sid,name,expire);
}