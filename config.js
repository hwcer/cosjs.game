"use strict";
const root = __dirname;

module.exports = {
    sid     : [1,2,3,4,5],                          //为1,2,3,4,5服提供服务
    app     :{"id":"test","secret":"123456"},
    root    : root,
    debug   : 2,
    gzone    : 0,                                                                                           //0:不分区,1:分区
    verify   :{"maxrms" : 10000,"secret":''},                                                           //客户端安全验证
    session  :{"secret":"109927657"},
}
//默认数据库，默认1,2,3,4,5服都使用此数据库
module.exports.dbs = {
    "0":{"cache": {'host':'127.0.0.1','port':6379}, "redis": {'host':'127.0.0.1','port':6380}, "mongodb":{'host':'127.0.0.1','port':27017}},
}
//单独配置5服数据库
//module.exports.dbs[5] = {"cache": {'host':'127.0.0.1','port':6379}, "redis": {'host':'127.0.0.1','port':6380}, "mongodb":{'host':'127.0.0.1','port':27017}}

//外部服务
module.exports.remote = {
    port     : 80,
    //fnum     : 1,
    shell    : root+'/process/remote',
    //https    : {"key":"","cert":""},  //HTTPS证书
}
//内部服务
module.exports.local = {
    port     : 8080,
    fnum     : 1,
    shell    : root+'/process/local',
}
//长连接，默认和remote使用同一端口时，此时remote必须单进程
module.exports.socket = {
    //port     : [85,86],
    shell    : root+'/process/socket',
}
/*
 * spirit 具有硬件监控，和负载均衡的功能，但是需要额外的 spirit 服务器来支持
 */
//硬件监控服务，并为服务器提供内部通信提供保障
// module.exports.spirit = {
//     "secret":'',
//     "update":{'ts':1},
//     "server":"http://127.0.0.1:3000" ,
// }
