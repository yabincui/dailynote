import React, { Component } from 'react';
import { fromJS } from 'immutable';

class BaseComponent extends Component {
	state = {
		data: fromJS({
			name: 'Mark',
			enabled: false,
			placeholder: '',
		}),
	}
	
	get data() {
		return this.state.data;
	}
	
	set data(data) {
		this.setState({ data });
	}
	
	render() {
		return null;
	}
}

class MyInput extends BaseComponent {
	
	componentWillMount() {
		this.data = this.data
			.merge({
				placeholder: 'Enter a name...',
				enabled: true,
			});
	}
	
	render() {
		const {
			enabled, name, placeholder,
		} = this.data.toJS();
		
		return (
			<label htmlFor="my-input">
				Name:
				<input id="my-input"
					disabled={!enabled}
					defaultValue={name}
					placeholder={placeholder} />
			</label>
		);
	}
}

class Exp2 extends Component {
	
	render() {
		return (
			<section>
				<MyInput />
			</section>
		);
	}
}

export default Exp2;