import React, { Component } from 'react';
import cuid from 'cuid';
import { fromJS } from 'immutable';

class ErrorMessage extends Component {
	render() {
		if (!this.props.error) {
			return null;
		}
		return (<strong>{this.props.error}</strong>);
	}
}

class LoadingMessage extends Component {
	render() {
		if (!this.props.loading) {
			return null;
		}
		return (<em>{this.props.loading}</em>);
	}
}

class UserList extends Component {
	render() {
		if (!this.props.users) {
			return null;
		}
		return (
			<section>
				<ErrorMessage error = {this.props.error} />
				<LoadingMessage loading = {this.props.loading} />
				<ul>
					{this.props.users.map(i => (
						<li key={i.id}>{i.name}</li>
					))}
				</ul>
			</section>
		);
	}
}

class UserListContainer extends Component {
	
	state = {
		data: fromJS({
			error: null,
			loading: null,
			users: [],
		}),
	}
	
	get data() {
		return this.state.data;
	}
	
	set data(data) {
		this.setState({ data });
	}
	
	componentWillMount() {
		this.data = this.data
			.set('loading', this.props.loading);
	}
	
	users(fail) {
		return new Promise((resolve, reject) => {
			setTimeout(() => {
				if (fail) {
					reject('epic fail');
				} else {
					resolve({
						users: [
							{ id: 0, name: 'First'},
							{ id: 1, name: 'Second'},
							{ id: 2, name: 'Third'},
						],
					});
				}
			}, 2000);
		});
	}
	
	componentDidMount() {
		this.users(false).then(
			(result) => {
				this.data = this.data
					.set('loading', null)
					.set('error', null)
					.set('users', fromJS(result.users));
			},
			(error) => {
				this.data = this.data
					.set('loading', null)
					.set('error', error)
			}
		);
	}
	
	render() {
		return (
			<UserList {...this.data.toJS()} />
		);
	}
}

UserListContainer.defaultProps = {
	loading: 'loading...',
}


class MyButton extends Component {
	
	render() {
		const {clicks, text, onClick} = this.props;
		console.log('MyButton disabled = ' + this.props.disabled);
		return (
			<section>
				<p>{clicks} clicks </p>
				<button disabled={this.props.disabled} onClick={onClick}>
					{text}
				</button>
			</section>
		);
	}
}

class MyButtonClickCount extends Component {
	
	state = {
		data: fromJS({
			clicks: 0,
			disabled: false,
			text: '',
		}),
	}
	
	get data() {
		return this.state.data;
	}
	
	set data(data) {
		this.setState({ data });
	}
	
	componentWillMount() {
		this.data = this.data
			.set('text', this.props.text);
	}

	componentWillReceiveProps({ disabled }) {
		this.data = this.data
			.set('disabled', disabled);	
	}
	
	onClick = () => {
		this.data = this.data
			.update('clicks', c => c + 1);
	}
	
	render() {
		return (
			<MyButton onClick={this.onClick}
				{...this.data.toJS()} />
		);
	}
}

MyButtonClickCount.defaultProps = {
	text: 'A Button',
};


class Exp1 extends Component {

	users = [{id: 1, name: 'cyb'}, {id: 2, name: 'linlin'}]
	
	state = {
		button_disabled : true,
	}

	componentDidMount() {
		setInterval(this.timer, 3000);
	}
	
	timer = () => {
		this.setState((prevState, props) => {
			return { button_disabled : !prevState.button_disabled };
			});
	}

	render() {
		console.log('render ' + this.state.button_disabled);
		return (
			<section>
				<MyButtonClickCount disabled={this.state.button_disabled} />
				<UserListContainer loading={'loading the game...'} />
			</section>
		);
		return (
			<section>
				<ErrorMessage error={null} />
				<ErrorMessage error={'hello'} /> <br/>
				<LoadingMessage loading={'loading...'} />
				<UserList users={this.users} />
			</section>
		);
	}

}

export default Exp1;