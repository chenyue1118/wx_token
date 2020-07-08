const express = require('express')
var app = express();

const crypto = require('crypto');
const url = require('url');

const WX_TOKEN = 'xiefengyiaoyoucanghai'

//进行sha1加密
function sha1(str) {
    let shasum = crypto.createHash("sha1");
    return shasum.update(str,'utf-8').digest("hex");
}

function wechatAuth(req, res) {
    let signature = req.query.signature;
    let echostr = req.query.echostr;
    let timestamp = req.query.timestamp;
    let nonce = req.query.nonce;

    let reqArray = [nonce, timestamp, WX_TOKEN]; // WX_TOKEN对应填写服务器配置内的 Token

    reqArray.sort(); //对数组进行字典排序
    let sortStr = reqArray.join(''); //连接数组
    let sha1Str = sha1(sortStr.toString().replace(/,/g,""));
    if (signature === sha1Str) {
        res.end(echostr);
    } else {
        res.end("false");
        console.log("授权失败!");
    }
}

app.use('/wx/token',wechatAuth); // 对应填写服务器配置内的 URL


app.listen(9090, () => {
  console.log('Server at 9090');
})
