import React, { Component } from 'react';

class MyButton extends Component {

	onClick() {
		console.log('clicked');
	}

	render() {
		return (
			<button onClick={this.onClick}>
				{this.props.children}
			</button>
		);
	}
}

class MyInput extends Component {
	onChange() {
		console.log('changed');
	}
	
	onBlur() {
		console.log('blured');
	}
	
	render() {
		return (
			<input
				onChange={this.onChange}
				onBlur={this.onBlur}
			/>
		);
	}
}

class MyCollection extends Component {
	render() {
		const array = [
			'First', 'Second', 'Third',
		];
		const object = {
			first: 1, second: 2, third: 3,
		}
		return (
			<section algin="center">
				<h1>Array</h1>
				<ul>
					{array.map(i => (
						<li key={i}>{i}</li>
					))}
				</ul>
				<h1>Object</h1>
				<ul>
					{Object.keys(object).map(i => (
						<li key={i}>
							<strong>{i}: </strong>{object[i]}
						</li>
					))}
				</ul>
			</section>
		);
	}
}

class StateButton extends Component {
	constructor(props) {
		super(props);
		this.state = {
			first: false,
			second: true,
		}
		setInterval(() => {
			this.setState(function(prevState, props) {
				return {
					first: !prevState.first,
					second: !prevState.second,
				};
			});
		}, 3000);
	}
	
	render() {
		const { first, second } = this.state;
		
		return (
			<section>
				<button disabled={first}>First</button>
				<br />
				<button disabled={second}>Second</button>
			</section>
		);
	}
}

class MyList extends Component {
	constructor(props) {
		super(props);
		this.onClick = this.onClick.bind(this);
	}
	
	onClick(id) {
		const { name } = this.props.items.find(
			i => i.id === id
		);
		console.log('MyList click ' + name)
	}


	render() {
		const { items } = this.props;
		var callback = this.onClick;
		return (
			<ul>
				{items.map(function({id, name}) {
					return (
						<li key={id}
							onClick={callback.bind(null, id)}
						> {name} </li>
					);
				})}
			</ul>
		);
	}
}

class FetchData extends Component {
	constructor(props) {
		super(props);
		this.state = { items: [] };
	}
	
	componentDidMount() {
		var promise = new Promise((resolve) => {
			setTimeout(() => {
				resolve([
					{id: 0, name: 'First'},
					{id: 1, name: 'Second'},
					{id: 2, name: 'Third'},
				]);
			}, 2000);
		});
		promise.then(items => this.setState({ items }))
	}

	render() {
		return (
			<MyList {...this.state} />
		);
	}
}

class MyComponent extends Component {
  render() {
    return (
    	<section>
    		<h1>My Component</h1>
    		<p>Content in my component...</p>
    		{this.props.children}
    		<MyCollection />
    		<StateButton />
    		<FetchData />
    		<MyInput />
    	</section>
    );
  }
}

MyComponent.MyButton = MyButton;

export default MyComponent