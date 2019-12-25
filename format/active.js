//活动记录
exports = module.exports = {
    //"_id":{'type':'string','val':''},           //uid-id
    "id":{'type':'string','val':''},         //活动ID
    "uid":{'type':'string',"val":""},          //uid
    "val":{'type':'json','val':{} },          //活动记数
    "ttl":{'type':'int','val':0},             //过期时间
};

//ttl < 0 前端不会获取到