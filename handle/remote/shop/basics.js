"use strict";
/**
 * @name basics
 * 礼包商城
 */

/**
 * @name /
 * @param int id 商品ID
 * @param int num 购买数量
 * 常规购买
 */
module.exports = function(){
    let id = this.get('id','int');
    let num = this.get('num','int')||1;
    if( !id || !num ){
        return this.error("args empty");
    }
    let shopBasics = this.config("shopBasics",id)
    if(!shopBasics){
        return this.error("config_not_exist",["shopBasics",id]);
    }

    for(let sub of shopBasics["sub"]){
        this.updater.sub(sub["id"],sub["num"] * num);
    }

    let {err,ret} = this.updater.item.group(shopBasics['item'],num);

    if(err){
        return this.error(err,ret);
    }

    let dkey = ['shop','basics',id].join(".");

    if( shopBasics['dnum'] || shopBasics['wnum'] ){
        this.updater.daily.add(dkey,num);
    }
    return this.library.call(this.updater,'shop/limit',shopBasics['limit']).then((d)=>{
        if(shopBasics['dnum'] > 0){
            let v = this.updater.daily.get(dkey)||0;
            let m = shopBasics['dnum'] - v;
            if( num > m ){
                return this.error("shop_dnum_limit",num , m)
            }
        }
    }).then(()=>{
        if(shopBasics['wnum'] > 0 ){
            return this.updater.daily.model.week(dkey).then(ret=>{
                let v = ret[dkey]||0;
                let m = shopBasics['wnum'] - v;
                if( num > m ){
                    return this.error("shop_wnum_limit",num , m);
                }
            })
        }
    }).then(()=>{
        return this.updater.save();
    })
}