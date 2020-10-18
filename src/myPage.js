import React from 'react';

class MyPage extends React.Component{
	constructor(props){ //构造函数
		super(props);
		this.state = {
			mytext : '',
			valueObj:'aaa'
		}
		setTimeout(()=>{
			this.setState({valueObj: 'bbb'});
		},1000);
	}
	handleClick(){
		this.getData();
	}
	getData(){
		let myHost = document.location.host;
		let that = this;
		fetch('http://'+ myHost.replace('3000','7001') + '/api/solar/getStatus',{
	      method:'GET',
	      headers:{
	        'Content-Type':'application/json;charset=UTF-8'
	      },
	      mode:'cors',
	      cache:'default'
	    }).then(res => res.text()).then(text=>{
			console.log(text);
			this.setState({valueObj: text});
		});
	}
	render(){
		return <div>{this.state.valueObj}<a onClick={e => this.handleClick(e)}>refresh</a></div>
	}
}
export default MyPage;