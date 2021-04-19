const rpio=require('rpio');
//1,2,3,4 => 11,12,13,15
//5,6,7,8 => 37,35,33,31
//5(48v same voltage) => 29


class ControlSwitch{
	constructor(){
            let option={gpiomem:true,mapping:'physical'};
            rpio.init(option);
this.baseFuncPin = [11,12,13,15];//globalPower, backupPower, routerPower, sameVoltage; 属于低电平触发；
this.globalPowerPin = this.baseFuncPin[0];
this.backupPowerPin = this.baseFuncPin[1];
this.routerPowerPin = this.baseFuncPin[2];
this.sameVoltagePin = this.baseFuncPin[3];
this.sameVoltageFlag = null;
this.routerPowerFlag = null;
this.globalPowerFlag = null;
this.backupPowerFlag = null;
this.collectSolarFlag = null;

this.switchArr = [29,31,33,35,32,36,38,40];//继电器为高电平触发
	    for(let pini of this.switchArr){
	    	rpio.open(pini, rpio.OUTPUT);
		rpio.write(pini, rpio.LOW);
	    	console.log('init:'+pini);
	    }
	    for(let pini of this.baseFuncPin){
	    	rpio.open(pini, rpio.OUTPUT);
		//rpio.write(pini, rpio.HIGH);
	    	console.log('init:'+pini);
	    }
		this.count =0;

	}
	setGlobalPower(flag){
             if(flag !== this.globalPowerFlag){
		rpio.write(this.globalPowerPin, flag? rpio.HIGH: rpio.LOW);//二级大功率继电器使用NC正常工作
		console.log('globalPowerFlag  '+ (flag? 'on':'off'), new Date().toString());
	     }
	     this.globalPowerFlag= flag;
	}
	setBackupPower(flag){
             if(flag !== this.backupPowerFlag){
		rpio.write(this.backupPowerPin, !flag? rpio.HIGH: rpio.LOW);
		console.log('backupPower '+ (flag? 'on':'off'), new Date().toString());
	     }
	     this.backupPowerFlag= flag;
	}
	setRouterPower(flag){
             if(flag !== this.routerPowerFlag){
		rpio.write(this.routerPowerPin, (!flag? rpio.HIGH: rpio.LOW));
		console.log('routerPower '+ (flag? 'on':'off'));
	     }
             //rpio.write(this.routerPowerPin, rpio.LOW);
	     this.routerPowerFlag = flag;
	}
	setSameVoltage(flag){
		if(flag){
			if(this.sameVoltageFlag !== true){
			        rpio.write(this.sameVoltagePin, rpio.HIGH);//48v balance, HIGH is connect,the same voltage
				console.log('same voltage connect!',new Date().toString());
			}
		} else {
			if(this.sameVoltageFlag !== false){
			        rpio.write(this.sameVoltagePin, rpio.LOW);//48v balance, LOW is disconnect.
				console.log('same voltage disconnect!', new Date().toString());
			}
		}
		this.sameVoltageFlag = flag;
	}
	setCollectSolar(flag){
		if(flag){
                    if(this.collectSolarFlag !== flag){
		        //----------分隔线开始，两线之间为汇聚电流，只允许一个HIGH，否则短路。
		        //rpio.write(this.switchArr[4],rpio.LOW);
		        rpio.write(this.switchArr[5],rpio.LOW);
		        rpio.write(this.switchArr[6],rpio.LOW);
		        rpio.write(this.switchArr[7],rpio.LOW);
		        rpio.write(this.switchArr[4],rpio.HIGH);
		        //----------分隔线结束
		        //rpio.write(this.switchArr[0],rpio.HIGH);
		        rpio.write(this.switchArr[1],rpio.HIGH);
		        rpio.write(this.switchArr[2],rpio.HIGH);
		        rpio.write(this.switchArr[3],rpio.HIGH);
			console.log('collection charge!',new Date().toString());
		    }
		}else{
                    if(this.collectSolarFlag !== flag){
		        rpio.write(this.switchArr[0],rpio.LOW);
		        rpio.write(this.switchArr[1],rpio.LOW);
		        rpio.write(this.switchArr[2],rpio.LOW);
		        rpio.write(this.switchArr[3],rpio.LOW);
		        rpio.write(this.switchArr[4],rpio.LOW);
		        rpio.write(this.switchArr[5],rpio.LOW);
		        rpio.write(this.switchArr[6],rpio.LOW);
		        rpio.write(this.switchArr[7],rpio.LOW);
			console.log('independence charge!',new Date().toString());
		    }
		}
		this.collectSolarFlag = flag;
	}
	loopSwitch(){
		for(let i =0 ; i < this.switchArr.length; i++){
			rpio.write(this.switchArr[i],(this.count++ % 8==0)? rpio.HIGH: rpio.Low);
		}
	}
	startLoop(){
		//setInterval(()=>{this.loopSwitch()}, 2000);
	}

}

module.exports = {
    ControlSwitch
}
