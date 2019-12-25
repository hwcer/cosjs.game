//每日数据
exports = module.exports = {
    //"_id":{'type':'string','val':''},                    //uid|time
    "uid": {'type': 'string', "val": ""},                  //uid
    "time": {'type': 'int', 'val': 0},                     //20161103
    "login": {'type': 'int', 'val': 0},                    //每日登录,固定为1
   
    "shop": {'type': 'json', 'val': {}},                   //商店记录，{"special":特殊购买次数,"basics":礼包购买次数,"refresh":"随机刷新次数"}

    "task": {'type': 'json', 'val': {}},                     //每日任务,0:完成任务数量

    "share": {'type': 'json', 'val': {}},                    //广告分享次数
}