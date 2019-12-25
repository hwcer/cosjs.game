"use strict";
/**
 * @name friend
 * 好友系统
 */

/**
 * @name getter
 * @param int val 类型：-1：我发出的申请，0：等待我确认的申请,1:正式好友
 * @param string key 额外字段
 * 好友列表
 */

exports.getter = function () {
    let val = this.get('val','number') || 0;
    let key = this.get('key','string')

    return Promise.resolve().then(()=>{
        let query = {"uid":this.uid,"val":val}
        let option = {"multi":true,"dataType":"array","fields":{"_id":-1, "fid":1} };
        let friend = this.model.mongo("friend",this.sid);
        return friend.find(query,option);
    }).then(ret=>{
        if(ret.length === 0){
            return this.success(ret);
        }
        let arr = [];
        for(let d of ret){
            arr.push(d.fid);
        }
        let role = this.model.mongo("role",this.sid);
        let fields = {"name":1};
        let query = {"_id":{"$in":arr} };
        let option = {"multi":true,"dataType":"array","fields":fields};
        if(key){
            let arrKey = key.split(",");
            for(let k of arrKey){
                fields[k] = 1;
            }
        }
        return role.find(query,option);
    })
}

/**
 * @name add
 * @param string fid 好友ID
 * 添加好友
 */

exports.add = function () {
    let fid = this.get('fid');
    if ( !fid ) {
        return this.error( 'fid not exist');
    }
    if ( this.uid === fid ) {
        return this.error('is self');
    }
    let config = this.config.get("friend");
    if( !config ){
        return this.error("friend disabled");
    }

    this.friend = this.model.mongo("friend",this.sid);
    return this.friend.uget(this.uid,fid).then(r=>{
        if(r){
            return this.error("friend_record_exist",fid,r['val'])
        }
        else {
            return verify_friend_number.call(this,fid);
        }
    }).then(r=>{
        return this.friend.apply(this.uid,fid).then(()=>1);
    })
}



/**
 * @name refuse
 * @param string fid 申请人UID，空：一键拒绝
 * 拒绝申请
 * 拒绝申请时调用此接口直接删除
 * 好友系统不需要验证时，不要调用此接口
 */
exports.refuse = function () {
    let fid = this.get('fid');
    let friend = this.model.mongo("friend",this.sid);
    return friend.refuse(this.uid,fid);
}


/**
 * @name accept
 * @param string fid 申请人UID
 * 通过申请
 */
exports.accept = function () {
    let fid = this.get('fid', 'string');
    if (!fid) {
        return this.error('fid empty');
    }
    let config = this.config.get("friend");
    if(!config || config["apply"] == 1){
        return this.error("friend_submit_disable")
    }
    let locks = this.model.redis("locks",this.sid,"friend");

    this.friend = this.model.mongo("friend",this.sid);
    return this.friend.uget(this.uid,fid).then(r=>{
        if(!r || r["val"] >0){
                return this.error("friend_apply_empty",fid);
            }
            else {
                return locks.start( [this.uid,fid] );
            }
        }).then(r=>{
            if(r.length > 0){
                return this.error("friend_submit_locked",r);
            }
            else {
                return verify_friend_number.call(this,fid);
            }
        }).then(r=>{
            return this.friend.accept(this.uid,fid);
        }) .then(r=>{
            return locks.clear().then(()=>r);
        })
}


/**
 * @name remove
 * @param string fid 好友UID
 * 删除好友
 */
exports.remove = function () {
    let fid = this.get('fid');
    if ( !fid ) {
        return this.error( 'fid empty');
    }
    let removeConfig = this.config.get("friend.remove");
    let friend = this.model.mongo("friend",this.sid)
    if(!removeConfig){
        return friend.del(fid);
    }
    this.updater.daily.add(removeConfig['key'],1);
    return this.updater.data().then(r=>{
            let DRMVal = this.updater.daily.get(removeConfig['key'])||0;
            if(DRMVal >= removeConfig['val']){
                return this.error("friend_remove_limit",DRMVal ,removeConfig['val'] )
            }
        }).then(r=>{
            return friend.del(this.uid,fid);
        }).then(r=>{
            return this.updater.save()
        })
}


function verify_friend_number(fid,callback) {
    let config = this.config.get("friend");
    if(!config){
        return callback("config_not_exist","friend");
    }

    let arr = [this.uid,fid];

    let keys = ["_id"];
    let limit = config['limit'];
    if(Array.isArray(limit) && limit[0]){
        keys.push(limit[0]);
    }
    let role = this.model.mongo("role",this.sid);
    let roles;
    return role.get(arr,keys)
        .then(r=>{
            roles = r;
            if(!roles || !roles[fid]){
                return this.error("user_not_exist",fid)
            }
            else {
                return this.friend.sum(arr,1);
            }
        })
        .then(count=>{
            //检查自己
            let selfMaxNum = sum_friend_number.call(this,config,roles[this.uid]);
            if( count[this.uid] && count[this.uid]["num"] >= selfMaxNum ){
                return this.error('friend_max_self', [count[this.uid]["num"] , selfMaxNum]);
            }
            //检查对方,非关注模式
            if(config['apply'] > 0) {
                let targetMaxNum = sum_friend_number.call(this, config, roles[fid])
                if (count[fid] && count[fid]["num"] >= targetMaxNum) {
                    return this.error('friend_max_target', [count[fid]["num"], targetMaxNum]);
                }
            }
            return count;
        })
}


//计算好友最大数量
function sum_friend_number(config,role) {
    let limit = config['limit'];
    if( !role || !Array.isArray(limit)){
        return 0;
    }
    if(!limit[0]){
        return parseInt(limit[1]);
    }
    let key = limit[0];
    let val = role[key]||0;
    let UConfig = this.config('level', val);
    if (!UConfig){
        return 0;
    }
    return UConfig[limit[1]]||0;
}