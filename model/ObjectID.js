"use strict";
/*
用户层面ObjectID 只能在agent下执行
 */

const SplitChar = '-';

//检查是不是_id
function verify(uid,id){
    if(!uid){
        throw new Error('model.ObjectID.verify[uid] empty');
    }
    let arr = String(id).split(SplitChar);
    if(arr.length > 1 && arr[0] == uid ){
        return arr;
    }
    else{
        return false;
    }
}

//返回_id
function ObjectID(uid,id){
    if(!uid){
        throw new Error('model.ObjectID[uid] empty');
    }
    if(verify(uid,id) ){
        return id;
    }
    else{
        return [uid,id].join(SplitChar);
    }
}

module.exports = function(uid,id){
    if(!Array.isArray(id)){
        return ObjectID(uid,id);
    }
    let arr = [];
    for(let k of id){
        arr.push(ObjectID(uid,k));
    }
    return arr;
}



module.exports.parse = function(uid,id){
    if(!uid){
        throw new Error('model.ObjectID.parse[uid] empty');
    }
    if( typeof id === 'object'){
        return id;
    }
    let ret={},arr = verify(uid,id);
    if(arr){
        ret['_id'] = id;ret['id'] = arr[1];
    }
    else{
        ret['_id'] = [uid,id].join(SplitChar); ret['id'] = id;
    }
    ret['uid'] = uid;
    return ret;
}

module.exports.verify = verify;