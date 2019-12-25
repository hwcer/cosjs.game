/**
 * @name sort
 * 排行榜
 */
/**
 * @name /
 * @param string key 排行榜标识
 * @param int si 开始位置(0开始)
 * @param int ei 结束位置(开始)
 * @param string fields 需要额外获取玩家的基本信息
 * 排行榜
 * arena:竞技场
 */
module.exports = function () {
    let key = this.get('key', 'string');
    let fields = this.get('fields', 'string');
    let arrFields = fields ? fields.split(",") : [];
    let defaultFields = ['lv','name'];
    if(!key){
        return this.error("key empty")
    }
    this.sortModel  = this.model.redis("sort",this.sid,key);
    this.dataModel  = this.model.mongo("role",this.sid);
    this.dataFields = defaultFields.concat(arrFields);
    return get_sort_range.call(this);
}



//获取排行榜信息

function get_sort_range(){
    let si = this.get('si', 'int')||0;
    let ei = this.get('ei', 'int')||19;

    if( !ei || ei<=si || (ei - si) >20){
        return this.error('args error');
    }
    let result = {'sort':-1,'rows':[],'order':{} };
    return this.sortModel.range(si,ei,1).then(ret=>{
        if(!ret || ret.length ==0){
            return result;
        }
        let k = 0;
        for (let i = 0; i < ret.length; i += 2) {
            let j = i + 1;
            let id = ret[i];
            let val = [si + k,Math.floor(ret[j])];
            result.order[id] = val;
            k++;
        }
        return get_user_data.call(this,result);
    })
}


function get_user_data(result){
    let keys = Object.keys(result.order);
    return this.dataModel.get(keys, this.dataFields).then(ret=>{
            if(!ret){
                return result;
            }
            let self_sort = 0;
            for(let k in ret){
                let row = ret[k];
                row['_id'] = k;
                row['val'] =  result.order[k][1];
                row['sort'] = result.order[k][0];
                result.rows.push(row);
                if(k == this.uid){
                    self_sort = 1;
                    result['sort'] = row['sort'];
                }
            }
            delete result.order;
            if(self_sort){
                return result;
            }
            else{
                return get_user_sort.call(this,result);
            }
        })
}


function get_user_sort(result){
    if(!this.uid){
        return result;
    }
    return this.sortModel.get(this.uid).then(ret=>{
        result['sort'] = ret
        return result;
    })
}
