"use strict"


const mvc    = require('cosjs.mvc');
const bag    = mvc.config.get('igroup.bag');
const unit   = 10000;
const random  = mvc.library.require('random');
const promise = mvc.library.require('promise');
//id,num,filter
exports.group = function(id){
    let num = 1,next = 1,filter
    if(typeof arguments[next] === 'number'){
        num = arguments[next];next ++;
    }
    filter = arguments[next];
    if(Array.isArray(id)){
        return igroup_parse_array(id,num,filter);
    }
    else if(id){
        return igroup_parse_item(id,num,filter);
    }
    else{
        return promise.error("itemGroup_id_empty",id);
    }
}

//解析物品相对概率组
function igroup_parse_item(id,num,filter) {
    let iType = mvc.config("iTypes",String(id).substr(0,2) );
    if(!iType || iType['bag'] != bag ){
        return promise.error('item id not igroup',id);
    }
    let itemGroup = mvc.config(iType['config'],id);
    if(!itemGroup){
        return promise.error("config_not_exist",[iType['config'],id]);
    }
    let arr = Array.isArray(itemGroup) ? itemGroup : itemGroup['rows']||itemGroup['Coll'];
    let k = random.Relative(arr,'val',filter);
    if(k===false || !arr[k]){
        return promise.error("itemGroup_Relative_error",id);
    }
    let item = arr[k];
    return promise.error(null,{"id":item["key"],"num":item["num"] * num,"key":parseInt(k)} );
}


//解析数组
function igroup_parse_array(arr,num,filter) {
    let result = [];
    for(let v of arr){
        if(!random.Probability(v.val,unit) ){
            continue;
        }
        let k = v.id || v.key;
        let {err,ret} = igroup_parse_item(k,v['num'] * num,filter);
        if(err){
            return promise.error(err,ret);
        }
        else if(ret){
            result.push(ret);
        }
    }
    return promise.error(null,result);
}
