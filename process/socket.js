/*
启动长连接
 */
module.exports = function(port){
    let socket = require("cosjs.socket")(port);
    socket.worker('login','test path')

}

