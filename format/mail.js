//邮件
//db.mail.createIndex( { "time": 1 }, { expireAfterSeconds: 15*86400 } )
exports = module.exports = {
    "uid":{'type':'string','val':'',"add":2,"edit":0},
    "time":{'type':'time','val':0,"add":1,"edit":1},                 //time >当前时间,邮件不可见,,
    "attr":{'type':'string','val':'',"add":1,"edit":1},
    "from":{'type':'array','val':[]},                                 //发件人[uid,name]
    "type":{'type':'int','val':0,"add":1,"edit":1},                   //邮件类型0-常规，1-系统
    "title":{'type':'string','val':'',"add":1,"edit":1},               //系统邮件时 title : [mailid,arg...]
    "status":{'type':'int','val':0,"add":1,"edit":1},                //状态 0-未读,1-已读[附件未领],2-可清理[附件已领] 9-已标记删除
    "content":{'type':'string','val':'',"add":1,"edit":1},
};
//attr:x,id1,num1,x,id2,num2