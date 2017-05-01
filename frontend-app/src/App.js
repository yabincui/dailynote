import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import MyComponent from './MyComponent';
import Article from './Article';
import Exp1 from './Exp1';
import Exp2 from './Exp2';
import Routes from './Routes';


class App extends Component {
  render() {
  	return (
  		<Routes />
  	)
  
    return (
      <div className="App">
      	<div className="WantHide">
        	<div className="App-header">
          		<img src={logo} className="App-logo" alt="logo" />
          		<h2>Welcome to React</h2>
        	</div>
        	<p className="App-intro">
          	To get started, edit <code>src/App.js</code> and save to reload.
        	</p>
        	<MyComponent>
        		<MyComponent.MyButton>My Button Text1
        		</MyComponent.MyButton>
        	</MyComponent>
        	<Article />
	        <Exp1 />
	        <Exp2 />
        </div>
        <Exp2 />
        <Routes />
      </div>
    );
  }
}

export default App;
