
"use strict";
/**
 * @name task
 * 任务成就
 */

/**
 * @name rows
 * 任务记录
 */
exports.rows = function(){
    let taskModel = this.model.mongo('task',this.sid,this.uid);
    return taskModel.mget();
}

/**
 * @name submit
 * @param int id 任务ID
 * 领取奖励
 */
exports.submit = function(){
    let id = this.get("id","int") ||0;
    if(!id){
        return this.error("id empty")
    }
    let taskConfig = this.config("task",id);
    if(!taskConfig){
        return this.error("config_not_exist","task",id);
    }

    let taskModel = this.model.mongo('task',this.sid,this.uid);
    return taskModel.get(id).then(taskData=>{
        if(!taskData){
            taskData = {};
        }
        //限时任务判断
        if( taskConfig['ttl'] > 0 && taskData['ttl'] >= this.library("time/today") ){
            return this.error("task_expire_error",taskConfig['ttl']);
        }
        //任务链判断
        if( taskConfig['series'] && taskConfig['limit'][0] && taskData['val'] !== taskConfig['limit'][0]  ){
            return this.error("task_limit_error",taskConfig['limit'][0]);
        }
        return this.library.call(this.updater,"values",taskConfig['tar'],taskConfig['key']);
    }).then(val=>{
        if( ( taskConfig['compare'] > 0 && val > taskConfig['val'] ) || ( taskConfig['compare'] <= 0 && val < taskConfig['val'] ) ){
            return this.error('task_val_limit',val,taskConfig['val'],taskConfig['compare'] );
        }
        //任务道具
        for(let d of taskConfig['item']){
            if(d.id && d.num){
                this.updater.add(d.id , d.num);
            }
        }
        //更新任务记录
        let data = {"val":id};
        if(taskConfig['ttl']>0){
            let stime = taskConfig['ttl'] == 7 ? this.library("time/week") : this.library("time/today");
            data['ttl'] = this.library("time/expire",stime,taskConfig['ttl']);
        }

        return taskModel.set(id,data).then(()=>data);
    }).then((data)=>{
        return this.updater.save().then(()=>data);
    })
}




