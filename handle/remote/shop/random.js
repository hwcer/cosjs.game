/**
 * @name random
 * 随机商店
 */

/**
 * @name rows
 * @param int id 商店ID
 * @result：ttl-剩余自动刷新时间（S）,rows：商品列表
 * 商品列表
 */
exports.rows = function (){
    let id = this.get('id', 'int');
    if(!id ){
        return this.error('args empty');
    }

    let shopRandomType = this.config('shopRandomType',id);
    if(!shopRandomType  ){
        return this.error('config_not_exist','shopRandomType',id);
    }
    this.shop = this.model.redis('shop',this.sid);
    return this.shop.get(this.uid,id).then(ret=>{
        if(!ret){
            return refShopGoods.call(this,shopRandomType);
        }
        else {
            return this.shop.ttl(this.uid,id).then(ttl=> ({"ttl":ttl,"rows":ret}) )
        }
    })
}



/**
 * @name buy
 * @param int item 商品ID(随机商城配置ID)
 * 购买商品
 */
exports.buy = function () {
    let item = this.get('item', 'int');
    if(!item ){
        return this.error('args empty');
    }

    let shopRandomItems = this.config('shopRandomItems',item);
    if(!shopRandomItems ){
        return this.error('config_not_exist','shopRandomItems',item);
    }
    let id = shopRandomItems["type"];
    let shop = this.model.redis('shop',this.sid);
    return shop.get(this.uid,id,item).then(ret=>{
        if(ret < 1){
            return this.error('shop_item_empty',id);
        }
        for( let sub of shopRandomItems["sub"] ){
            this.updater.sub(sub['id'],sub['num'] );
        }
        for( let add of shopRandomItems["item"] ){
            this.updater.add(add['id'],add['num'] );
        }
        return this.library.call(this.updater,'shop/limit',shopRandomItems['limit']);
    }).then(r=>{
        return this.updater.save();
    }).then(r=>{
        return shop.incr(this.uid,id,item,-1);
    })
}


/**
 * @name refresh
 * @param int id 商店ID
 * 手动刷新
 */
exports.refresh = function () {
    let id = this.get('id', 'int');
    if(!id ){
        return this.error('args empty');
    }

    let shopRandomType = this.config('shopRandomType',id);
    if(!shopRandomType || !shopRandomType['refresh'] ){
        return this.error('config_not_exist','shopRandomType',id);
    }

    let dkey = ["shop",'refresh',id].join(".");
    this.shop = this.model.redis('shop',this.sid);
    this.updater.daily.add(dkey,1);
    return this.updater.data().then(r=>{
            let dval = this.updater.daily.get(dkey)||0;
            if( dval >= shopRandomType['refresh']){
                return this.error("shop_refresh_limit",dval , shopRandomType['refresh'])
            }
            let rkey = id * 1000 + dval+1;
            let shopRandomRefresh = this.config('shopRandomRefresh',rkey);
            if(!shopRandomRefresh ){
                return this.error('config_not_exist','shopRandomRefresh',rkey);
            }

            for( let sub of shopRandomRefresh["sub"] ){
                this.updater.sub(sub['id'],sub['num'] );
            }
            return this.library.call(this.updater,'shop/limit',shopRandomRefresh['limit']);
        }).then(r=>{
            return this.updater.save()
        }).then(r=>{
            return refShopGoods.call(this,shopRandomType);
        })
}



//商店刷新
function refShopGoods(config){
    let id = config["id"];
    let Relative = this.library("random").Relative;
    let shopRandomItems = this.config.search('shopRandomItems','type',id);
    if(!shopRandomItems){
        return this.error("config_not_exist",'shopRandomItems',id)
    }
    let goodsGroup = {}, goodsResult = {};
    for(let v of shopRandomItems){
        let k = v['id'];
        let bag = v["bag"];
        if(!goodsGroup[bag]) {
            goodsGroup[bag] = {};
        }
        goodsGroup[bag][k] = v;
    }

    for(let k in goodsGroup){
        let v = Relative(goodsGroup[k],"val");
        if(v!==false){
            goodsResult[v] = goodsMaxNum.call(this,goodsGroup[k][v]['max']);
        }
    }
    if(Object.keys(goodsResult).length<1){
        return this.error('shop_refresh_empty',id);
    }
    let expire = config["expire"] * 3600;
    return this.shop.del(this.uid,id).then(r=>{
            return this.shop.set(this.uid,id,goodsResult);
        }).then(r=>{
            return this.shop.expire(this.uid,id,expire);
        }).then(r=>{
            return {"ttl":expire,"rows":goodsResult};
        })
}


function goodsMaxNum(arr){
    if(!arr[1]){
        return arr[0]||1;
    }
    else {
        return this.library("random/Roll",arr[0],arr[1]);
    }
}