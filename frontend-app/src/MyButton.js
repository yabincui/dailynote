import React, { Component } from 'react';

class MyButton extends Component {
	render() {
		return (
			<button>{this.props.children}</button>
		);
	}
}

export default MyButton