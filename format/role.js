
exports = module.exports = {
    "_id":{'type':'string','val':""},
    "sid":{'type':'int','val':0},                            //数据版本
    //"open":{'type':'string','val':''},                        //渠道标识,多渠道绑定，无法记录来源
    "guid":{'type':'string','val':''},                       //账号唯一标识
    "name":{'type':'string',"val":""},

    "lv":{'type':'int','val':1},
    "exp":{'type':'int','val':0},
    "vip":{'type':'int','val':0},
    "vxp":{'type':'int','val':0},                                     //VIP EXP

    "step":{'type':'int','val':0},                                    //新手引导步骤
    "battle":{'type':'string','val':''},                             //战斗标记

    "time" : {'type':'int','val':""},                                 //创建时间
    "login" : {'type':'int','val':""},                                 //最后登录时间
    "sumlog" : {'type':'int','val':0},                                 //累计登录
    "conlog" : {'type':'int','val':0},                                 //连续登陆

    "online":{'type':'string','val':''},                              //长连接信息,不为空则表示在线
    "install":{'type':'int','val':0},                                  //初始化信息
};
