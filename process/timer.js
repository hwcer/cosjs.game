const mvc             = require('cosjs.mvc');
const cosjs           = require('cosjs');
const nodeSchedule    = require('node-schedule');


module.exports = function(){
    let loader = require('cosjs.loader')(null,2);
    Promise.resolve().then(()=>{
        let setting = require('../config');
        return loader.addPath(setting['root'] + '/worker')
    }).then(()=>{
        let root = mvc.config.get('root');
        return loader.addPath(root + '/worker')
    }).then(()=>{
        loader.forEach((k,p)=>{
            let m = loader.require(k);
            if(Array.isArray(m['schedule'])){
                worker_fork(m['schedule'],k.substr(1),p);
            }
            else{
                console.log(`worker[${k}] not schedule`);
            }
        })
    }).catch(err=>{
        console.log('process timer',err);
    })
}


function worker_fork(arr,...arg){
    for( let schedule of arr){
        let t,arr;
        if(Array.isArray(schedule)){
            t = schedule[0],arr=schedule.slice(1);
        }
        else{
            t = schedule,arr = [];
        }
        nodeSchedule.scheduleJob(t,function(){
            cosjs.cluster.worker.apply(null,arg.concat(arr));
        });
    }
}