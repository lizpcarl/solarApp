'use strict';

const SerialPort = require('serialport');
const fs = require('fs');
const Readline = require('@serialport/parser-readline')
//import parser-readline as Readline from 'serialport';

class ReadSerial {
    constructor() {
        this.port = new SerialPort('/dev/ttyUSB0', 9600);
        this.port.on('open', function () {
            /**port.write('main screen turn on', function(err) {
                if (err) {
                    return console.log('Error on write: ', err.message);
                }
                console.log('message written');
            });*/
        });
        // open errors will be emitted as an error event 
        this.port.on('error', function (err) {
            console.log('Error: ', err.message);
        });
        this.port.on('readable', function () {
            console.log('Data:', port.read())
        });
        // Switches the port into "flowing mode"
        this.port.on('data', data => {
            //console.log('Data:', data);
        });
        this.init();
    }
    init(callback) {
        try {
            // Pipe the data into another stream (like a parser or standard out)
            this.parser = this.port.pipe(new Readline({
                delimiter: '\r\n'
            }));
            this.parser.on('data', data => {
                //console.log(data);
                try {
                    let readObj = JSON.parse(data);
                    if (typeof callback == 'function') callback(readObj);
                    /**if(typeof readObj.Tempeature == 'number'){
                        console.log('Tempeature:',readObj.Tempeature);
                        let tmpFile = fs.createWriteStream('/tmp/series.txt');
                        tmpFile.write(data);
                        tmpFile.close();
                    }*/
                } catch (err) {
                    console.log('parse err:', err);
                }
            });
        } catch (err) {
            console.log('Readline err:', err);
        }
    }
}

module.exports = {
    ReadSerial
}