"use strict";
/**
 * @name wiki
 * 开发文档
 */

const fs = require('fs');
const mvc = require('cosjs.mvc');
/**
 * @name /
 * 开发文档
 */

module.exports = function () {
    let rows = {},loader = mvc.handle.remote();
    loader.forEach((k,p)=>{
        let info = getDocs(k,p);
        if(info){
            rows[k] = info;
        }
    });
    return rows;
}


function getDocs(k,root) {
    let docs = new parseDocs(root);
    if(!docs.parse()){
        return false;
    }
    let args = {name:k};
    let info = docs.getClass();
    if(!info){
        return false
    }
    args['desc'] = info['desc'];
    args['method'] = docs.getMethod();
    return args;
}

function parseDocs(file){
    let $calss;
    let $method={};
    let txt = fs.readFileSync(file).toString();
    let reg = "(/\\\*([^*]|[\\\r\\\n]|(\\\*+([^*/]|[\\\r\\\n])))*\\\*+/)|(//.*)";
    let exp = new RegExp(reg,"g");
    let arr = txt.match(exp);

    this.parse = function(){
        if(!arr){
            return false;
        }
        arr.forEach(function(str){
            let log = parse_code(str);
            if(!log){
                return false;
            }
            if(!$calss){
                $calss = log;
            }
            else {
                $method[log.name] = log;
            }
        });
        return true;
    }


    this.getClass = function(){
        return $calss;
    }

    this.getMethod = function(){
        return $method;
    }
}




function parse_code(str){
    if(str.substr(0,5).indexOf('*')  < 0){
        return false;
    }
    let arr = str.split("\n");
    let exp1 = /\/|\*/g;
    let exp2 = /\s+/g;
    let obj = {"name":"","param":[],"desc":[]};
    arr.forEach(function(s){
        let ss = s.replace(exp1,'').replace(exp2,' ').trim();
        if(ss.length<1){
            return;
        }
        if(ss.substr(0,1)!=='@'){
            obj.desc.push(ss);//  += ss + "\r\n";
        }
        else{
            let ps = ss.split(" ");
            let key = ps[0].substr(1);
            delete(ps[0]);
            let val = ps.join(' ').trim();
            if(key==='name'){
                obj.name = val;
            }
            else if(key==='param'){
                let $param = parse_param(ps);
                if($param){
                    obj['param'].push($param);
                }
            }
            else {
                obj[key] = val;
            }
        }
    });
    return obj;
}

function parse_param(arr){
    let p ={};
    p['key'] =arr[2] || '';
    p['type'] =arr[1] || '';
    p['name'] =arr[3] || '';
    return p;
}

