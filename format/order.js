//仅仅成功发货时记录发货结果
//索引，uid,time
module.exports = {
    "_id":{'type':'string','val':''},          //订单ID
    "sdk":{'type':'string','val':""},           //充值渠道
    "uid":{'type':'string','val':""},           //角色ID
    "cyt":{'type':'string','val':''},           //货币种类
    "val":{'type':'number','val':0},            //交易金额
    "item":{'type':'int','val':0},              //充值配置ID
    "time":{'type':'time','val':0},             //时间
    "status":{'type':'int','val':0},            //8：状态发货存在争议，需要找GM，9：成功
    "result": {'type':'array','val':[]},        //发货结果
};