const express = require('express')
const axios = require('axios')
const cors = require('cors')
var app = express();

const crypto = require('crypto');
const url = require('url');

app.use(express.static('./public'));

app.use(cors())

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
    console.log('sha1Str', sha1Str);
    if (signature === sha1Str) {
        res.end(echostr);
    } else {
        res.end("false");
        console.log("授权失败!");
    }
}

app.use('/wx/token',wechatAuth); // 对应填写服务器配置内的 URL

app.use('/wx/access_token', (req, res) => {
  const url = req.query.url
  // const url = 'http://10.100.92.77:8080/invoice.html#/'
  console.log('url---', url);
  const getTokenUrl = 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=wx3388423bc66c538a&secret=faea4114e0b72bd2496278f7553bfc8c'
  axios.get(getTokenUrl).then(response => {
    console.log(response.data)
    const access_token = response.data.access_token
    const getTicketUrl = `https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=${access_token}&type=jsapi`
    axios.get(getTicketUrl).then(response1 => {
      const jsapi_ticket = response1.data.ticket
      const noncestr = 'houhaiyoushudeyuanzi'
      const timestamp = parseInt((new Date().getTime()) / 1000)
      // URL
      const string1 = `jsapi_ticket=${jsapi_ticket}&noncestr=${noncestr}&timestamp=${timestamp}&url=${url}`
      const signature = sha1(string1)
      res.send({
        url: url,
        jsapi_ticket: jsapi_ticket,
        timestamp: timestamp,
        nonceStr: noncestr,
        signature: signature
      })
    })
  })
})


app.listen(7001, () => {
  console.log('Server at 7001');
})
