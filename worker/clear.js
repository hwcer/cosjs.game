//过期数据清理，日常，邮件，活动，任务

const mvc = require('cosjs.mvc');

module.exports = function(){
    let sid = mvc.config.get("sid")||[];
    if(sid.length < 1){
        return worker_finish();
    }
    let task = mvc.library("multi",sid,worker_lock);
    task.start().then(()=>{
        worker_finish();
    }).catch(err=>{
        console.log(`worker error`,err);
        worker_finish();
    })

}



//定时器,  string || [schedule,arg...]
module.exports.schedule = [
   ['30 1 5 * * *']
]



function worker_finish() {
    process.exit();
}


function worker_lock(sid){
    let locks = mvc.model.redis('locks',0,'worker-clear',3600);
    return locks.start(sid).then(ret=>{
        if(ret.length == 0){
            return worker_begin(sid);
        }
    })
}


function worker_begin(sid){
    let mongoKey = [];
    let mongoLoader = mvc.model.mongo();
    mongoLoader.forEach((k,v)=>{
        mongoKey.push(k.substring(1));
    })
    let task = mvc.library("multi",mongoKey,(key)=>{
        let M = mvc.model.mongo(key,sid);
        if(typeof M.clear === 'function'){
            return M.clear();
        }
    });
    return task.start()
}
