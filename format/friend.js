//好友，索引：uid，fid
exports = module.exports = {
    //"_id":{'type':'string','val':''},        //uid|fid
    "uid":{'type':'string','val':''},
    "fid":{'type':'string','val':''},        //好友ID
    "val":{'type':'int','val':0},             //好友度, -1:我发起的待对方通过的，0：等待我通过。>0，好友
    "time":{'type':'int','val':0},           //创建时间
};