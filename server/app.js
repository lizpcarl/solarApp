'use strict';

var express = require('express');
const path = require('path');
const crypto = require('crypto');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('cookie-session');
var app = express();
const ReadSerial = require('./ReadSerial');
const {
    ControlSwitch
} = require('./ControlSwitch');
const {
    connectLine,
    disconnectLine
} = require('./NVRControl');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(cookieParser());
app.all('*', function(req, res, next) {
    res.set('X-XSS-Protection', '1;mode=block');
    res.set('Strict-Transport-Security', 'max-age=31536000');
    res.set('Access-Control-Allow-Credentials', true);
    res.set('Access-Control-Allow-Methods', 'GET, POST');
    res.set('Access-Control-Allow-Origin', '*'); //todo,9443端口的Referer为443的web,存在跨域访问的问题。
    res.set('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Authorization');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.charset = 'utf-8';
    next();
});

app.get('/', function(req, res) {
    res.send('<script >document.location.href="/index.html";</script>');
});

let globalObj = {};
let myControl = new ControlSwitch();
// let needConnectSolar = 0;
let v48Arr = [],
    v12Arr = [];
const average = (...args) => args.reduce((acc, el) => acc + el, 0) / args.length;

if (ReadSerial) {
    let mySerial = new ReadSerial.ReadSerial();
    mySerial.init(jsonObj => {
        globalObj = jsonObj;
        if (jsonObj && jsonObj.VoltageList && jsonObj.VoltageList.length >= 5) {
            let vol12 = jsonObj.VoltageList[0];
            let v48cp = jsonObj.VoltageList[3];
            //if(v48cp > 52) myControl.setSameVoltage(true);
            //else if(v48cp < 50) myControl.setSameVoltage(false);
            /**if(v48cp < 40 || vol12 < 11){ 
		    myControl.setGlobalPower(false);
		    //myControl.setGlobalPower(true);
			}else 
			if(v48cp > 59){
				myControl.setGlobalPower(true);
			}*/
            v12Arr.push(vol12);
            v48Arr.push(v48cp);
            while (v12Arr.length > 3) v12Arr.shift();
            while (v48Arr.length > 3) v48Arr.shift();
        }
    });
}

function decisionChargeMode(v48avg, v12avg, nowHour) {
    //定义全组充满的上限触发线high，充满后恢复充电的触发线low。
    const v48Full_high = 58.2,
        v48Full_low = 53.9,
        v12Full_high = 14.4,
        v12Full_low = 13.5;
    let typeVal = 0;
    // needConnectSolar = (v48cp > 58.0) ? 2 : (v48cp > 53.8 ? 1 : 0);
    if (nowHour > 6 && nowHour < 18) { //白天
        if (v48avg > v48Full_high) { //达到上限，决定使用[bcdToNull,abcdToNull,bcdToA]
            if (v12avg > v12Full_high) {
                typeVal = 2; //abcdToNull
            } else if (v12avg < v12Full_low) {
                typeVal = 3; //bcdToA
            } else {
                typeVal = 1; //bcdToNull
            }
        } else if (v48avg > v48Full_low) {
            if (v12avg < v12Full_high) {
                typeVal = 3; //bcdToA
            } else {
                // typeVal = 0;
            }
        } else {
            // typeVal = 0;
        }
    } else { //晚上
        // typeVal = 0;
    }
    return typeVal;
}

function checkControl() {
    let newHour = new Date().getHours();
    if (newHour >= 0 && newHour < 25) {
        myControl.setGlobalPower(true);
    } else {
        myControl.setGlobalPower(false);
    }

    if (newHour >= 7 && newHour < 22) {
        //myControl.setBackupPower(false);
        myControl.setBackupPower(true);
    } else {
        myControl.setBackupPower(false);
    }
    if (newHour >= 6 && newHour < 20) {
        connectLine();
    } else {
        disconnectLine();
    }

    /**if (needConnectSolar == 3 || newHour >= 9 && newHour < 10) {
    	myControl.setCollectSolar(true);
    } else if (needConnectSolar == 0) {
    	myControl.setCollectSolar(false);
    }*/
    let chargeMode = decisionChargeMode(average.apply(this,v48Arr), average.apply(this,v12Arr), newHour);
    myControl.adjustCollectSolar(chargeMode);

    if (newHour >= 7 && newHour < 19) {
        myControl.setRouterPower(true);
    } else {
        myControl.setRouterPower(false);
    }
    if (newHour >= 9 && newHour < 17) { // && vol12 > 12.5){
        myControl.setSameVoltage(true);
    } else { // if(vol12 < 11){
        myControl.setSameVoltage(false);
    }

    //console.log('succeed to switch basePowser');
}
app.get('/api/solar/getStatus', function(req, res) {
    // res.send('Hello World');
    res.status(200);
    res.json(globalObj);
})

app.use(express.static(path.join(__dirname, '../build')));

var server = app.listen(7001, function() {
    var host = server.address().address;
    var port = server.address().port;

    console.log("太阳能控制系统已启动，访问地址为 http://%s:%s", host, port);
    setInterval(() => {
        checkControl();
    }, 5000);
    checkControl();
});