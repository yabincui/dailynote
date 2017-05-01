import React, { Component } from 'react';

import {
  BrowserRouter as Router,
  Route,
  Link,
  Redirect,
  browserHistory,
  IndexRedirect,
  Switch,
} from 'react-router-dom'

import NotePages from './ChangeNotePage';

class FirstPage extends Component {
	render() {
		return (
			<section>
				<p> This is the first page! </p>
				<nav>
					<ul>
						<li><Link to='/second'>Second</Link></li>
					</ul>
				</nav>
			</section>
		);
	}
}

class SecondPage extends Component {
	render() {
		return (<p> This is second page!</p>);
	}
}

class AboutPage extends Component {
	render() {
		return (<p> This is about page!</p>);
	}
}

class MyComponent extends Component {
	
	render() {
		return (
			<p>Hello Route!</p>
		);
	}
}

class NumberPage extends Component {

	componentDidMount() {
		console.log('NumberPage, prop = ' + this.props.match.params.number);
	}

	render() {
		return (
			<p>Number is {this.props.match.params.number} </p>
		);
	}
}

class Routes extends Component {
	
	render() {
		return (
			<section>
			<Router>
				<Switch>
					<Route path="/change_note_form"
						component={NotePages.ChangeNotePage} />
					<Route path="/list_notes"
						component={NotePages.ListNotePage} />
				</Switch>
			</Router>
			</section>
		);
		return (
				<Router>
				<Switch>
					<Route exact path="/" component={FirstPage} />
					<Route path="/first" component={FirstPage} />
					<Route path="/second" component={SecondPage} /> 
					<Route path="/about" component={AboutPage} />
					<Route path="/number/:number" component={NumberPage} />
				</Switch>
				</Router>
		);
	
	}
}

export default Routes;