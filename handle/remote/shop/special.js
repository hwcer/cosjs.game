"use strict";
/**
 * @name special
 * 特殊购买
 */


/**
 * @name /
 * @param int id 物品ID（不是商品ID，shopSpecial.key）
 * 购买道具
 */
module.exports = function () {
    let id = this.get('id','int');
    if (!id ) {
        return this.error('args empty');
    }

    let dkey  =["shop",'special',id].join(".");
    this.updater.daily.add(dkey,1);
    return this.updater.data()
        .then(r=>{
            let dnum = this.updater.daily.get(dkey)||0;
            let k = id * 100 + dnum + 1;
            let shopSpecial = this.config("shopSpecial",k);
            if(!shopSpecial){
                return this.error("config_not_exist","shopSpecial",id,dnum+1)
            }
            for(let sub of shopSpecial["sub"]){
                this.updater.sub(sub["id"],sub["num"] );
            }
            this.updater.add(shopSpecial["key"],shopSpecial["val"] );

            return this.library.call(this.updater,'shop/limit',shopSpecial['limit']);
        })
        .then(r=>{
            return this.updater.save();
        })
}