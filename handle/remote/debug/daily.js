"use strict";
/**
 * @name daily
 * 日常数据
 */


/**
 * @name edit
 * @param string key 字段名，可以使用"a.b.c"方式
 * @param string val 字段值
 * @param int vt 字段类型,0-int,1-string,2-json
 * @param int at 操作方式,0-set,1-add
 * 修改数据
 */

exports.edit = function () {
    let vts = {'0':'int','1':'string','2':'json'}
    let vt = this.get("vt","int")||0;
    if(!vts[vt]){
        return this.error("args[vt] error")
    }

    let key = this.get("key","string");
    let val = this.get("val",vts[vt]);
    if(!key){
        return this.error("args empty")
    }

    let at = this.get("at","int")||0;
    if(at >0){
        this.updater.daily.add(key,val);
    }
    else {
        this.updater.daily.set(key,val);
    }
    return this.updater.save().then(()=>{
        return this.updater.daily.get(key);
    })
}