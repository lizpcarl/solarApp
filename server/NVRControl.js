const net = require("net");

let connectFlag = 'none';
class NVRControl {
    constructor() {}
    buildConnect() {
        return new Promise((resolve, reject) => {
            this.sock = net.connect({
                port: 8080,
                host: "172.19.88.90",
            }, function () {
                console.log('connected to server!');
            });
            // 有错误发生调用的事件
            this.sock.on("error", function (e) {
                reject();
                console.log("error", e);
            });

            // socket关闭的事件
            this.sock.on("close", function () {
                console.log("close");
            });

            // 对方发送了关闭数据包过来的事件
            this.sock.on("end", function () {
                console.log("end event");
            });

            // 当有数据发生的时候，调用;
            this.sock.on("data", function (data) {
                console.log(data);
            });
            // 连接成功调用的事件
            this.sock.on("connect", () => {
                resolve();
            });
        });
    }
    doConnect() {
        try {
            this.buildConnect().then(() => {
                let buff = new Buffer([0xA0, 0x02, 0x01, 0xA3], 'hex');
                this.sock.write(buff);
                console.log('connected.');
                setTimeout(() => {
                    this.sock.end();
                    console.log('connected...end');
                }, 100);
            });
        } catch (e) {
            console.log(e);
        }
    }
    doDisconnect() {
        try {
            this.buildConnect().then(() => {
                let buff = new Buffer([0xA0, 0x02, 0x00, 0xA2], 'hex');
                this.sock.write(buff);
                console.log('disconnected.');
                setTimeout(() => {
                    this.sock.end();
                    console.log('disconnected...end');
                }, 100);
            });
        } catch (e) {
            console.log(e);
        }
    }
}

function connectLine() {
    if (connectFlag == true) return;
    connectFlag = true;
    let nvrObj = new NVRControl();
    nvrObj.doConnect();
}

function disconnectLine() {
    if (connectFlag == false) {
        //console.log('disconnect line',connectFlag);
        return false;
    }
    connectFlag = false;
    let nvrObj = new NVRControl();
    nvrObj.doDisconnect();
}

module.exports = {
    connectLine,
    disconnectLine
}