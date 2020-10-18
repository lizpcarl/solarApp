'use strict';

var express = require('express');
const path = require('path');
const crypto = require('crypto');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('cookie-session');
var app = express();
const ReadSerial = require('./readSerial');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.all('*', function (req, res, next) {
    res.set('X-XSS-Protection','1;mode=block');
    res.set('Strict-Transport-Security', 'max-age=31536000');
    res.set('Access-Control-Allow-Credentials', true);
    res.set('Access-Control-Allow-Methods', 'GET, POST');
    res.set('Access-Control-Allow-Origin', '*');//todo,9443端口的Referer为443的web,存在跨域访问的问题。
    res.set('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Authorization');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.charset = 'utf-8';
    next();
});

app.get('/', function (req, res) {
   res.send('Hello World');
})

let globalObj = {};
if(ReadSerial){
  	let mySerial = new ReadSerial.ReadSerial();
  	mySerial.init(jsonObj=>{
  		  globalObj = jsonObj;
  	});
}
app.get('/api/solar/getStatus', function (req, res) {
   // res.send('Hello World');
	res.status(200);
	res.json(globalObj);
})

app.use(express.static(path.join(__dirname, '../build')));

var server = app.listen(7001, function () {
 
  var host = server.address().address
  var port = server.address().port
 
  console.log("应用实例，访问地址为 http://%s:%s", host, port)
 
})