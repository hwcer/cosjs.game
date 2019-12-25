const mvc = require('cosjs.mvc');


module.exports = function(){
    let sid = parseInt(arguments[0]);
    if(!sid){
        return Promise.reject('sid empty');
    }
    let arr = mvc.config.get("sid");
    if(arr.indexOf(sid) < 0){
        return Promise.reject(`sid[${sid}] not exist`);
    }
    let M = mvc.model.loader._moduleCache;
    let task = mvc.library('multi',Object.keys(M),createIndex.bind(null,sid) );
    task.breakOnError = true;
    return task.start();
}


function createIndex(sid,name){
    if(name.substr(0,7) !== '/mongo/'){
        return true;
    }
    let mod = mvc.model.loader.require(name);
    if(!mod.indexes){
        return true;
    }
    
    let mk = name.substr(7);
    let mongo = mvc.model.mongo(mk,sid);
    let indexes = mod.indexes;
    
    return mongo.collection().then(coll=>{
        let task = mvc.library('multi',indexes,function(arr){
            console.log("mongodbIndexes",JSON.stringify(arr));
            return coll.createIndex(arr[0],arr[1]);
        })
        task.breakOnError = true;
        return task.start();
    })
}



