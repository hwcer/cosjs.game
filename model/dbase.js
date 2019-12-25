"use strict";
const mvc = require('cosjs.mvc');
const cosjs = require('cosjs');

const _gzone        = mvc.config.get("gzone");
const _dbname       = mvc.config.get("dbname")||mvc.config.get("appid");
const _mongo        = require('cosjs.mongo');
const _redis        = require('cosjs.redis');

exports.gzone = {}
//公共MONGODB
exports.mongo = class mongo extends _mongo {
    constructor(sid,name,upsert){
        let id = _gzone ? sid : 0;
        let pkey = ["mongodb",id].join('');
        let dbname = [_dbname,id].join('-');

        let mongo = cosjs.pool.get(pkey);
        if(!mongo){
            throw new Error(`dbase mongodb[${pkey}] empty`)
        }
        super(mongo,dbname,name,upsert);
    }
}
//基础CACHE
exports.cache = class cache extends _redis.struct {
    constructor(sid,name,format){
        let pkey = ["cache",sid].join("");
        let redis = cosjs.pool.get(pkey);
        if(!redis){
            throw new Error(`dbase cache[${pkey}] empty`)
        }
        let prefix = [_dbname,'C',sid,name].join('-');
        let formatOpt = format ? mvc.format(format) : null;
        super(redis,prefix,formatOpt);
    }
}

//公共REDIS
exports.redis = class redis extends _redis.struct {
    constructor(sid,name,format){
        let id = _gzone ? sid : 0;
        let pkey = ["redis",id].join('');
        let prefix = [_dbname,'R',id,name].join('-');

        let redis = cosjs.pool.get(pkey);
        if(!redis){
            throw new Error(`dbase redis[${pkey}] empty`)
        }
        let formatOpt = format ? mvc.format(format) : null;
        super(redis,prefix,formatOpt);
    }
}

//排行榜
exports.rank = class rank extends _redis.rank {
    constructor(sid,name){
        let id = _gzone ? sid : 0;
        let pkey = ["redis",id].join('');
        let prefix = [_dbname,'Z',id,name].join('-');

        let redis = cosjs.pool.get(pkey);
        if(!redis){
            throw new Error(`dbase zset[${pkey}] empty`)
        }
        super(redis,prefix);
    }
}
//用户锁
exports.locks = class locks extends _redis.locks {
    constructor(sid,name){
        let pkey = ["cache",sid].join("");
        if(sid > 0){
            pkey = ["cache",sid].join("");
        }
        else{
            pkey = ["redis",0].join("");
        }
        let redis = cosjs.pool.get(pkey);
        if(!redis){
            throw new Error(`dbase gzone.lock[${pkey}] empty`)
        }
        let prefix = [_dbname,'L',sid,name].join('-');
        super(redis,prefix);
    }
}


