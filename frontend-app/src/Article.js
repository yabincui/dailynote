import React, { Component } from 'react';
import cuid from 'cuid';
import { fromJS } from 'immutable';

class Article extends Component {

	state = {
		data: fromJS({
			articles: [
				{
					id: cuid(),
					title: 'Article 1',
					summary: 'Article 1 Summary',
					display: 'none',
				},
				{
					id: cuid(),
					title: 'Article 2',
					summary: 'Article 2 Summary',
					display: 'none',
				}
			],
			title: '',
			summary: '',
		})
	}
	
	get data() {
		return this.state.data;
	}
	
	set data(data) {
		this.setState({ data });
	}

	onChangeTitle = (e) => {
		this.data = this.data.set(
			'title',
			e.target.value,
		);
	}
	
	onChangeSummary = (e) => {
		this.data = this.data.set(
			'summary',
			e.target.value
		);
	}
	
	onClickAdd = () => {
		this.data = this.data.update(
			'articles',
			a => a.push(fromJS({
				id: cuid(),
				title: this.data.get('title'),
				summary: this.data.get('summary'),
				display: 'none',
			}))
		
		).set('title', '').set('summary', '');
	}
	
	onClickRemove = (id) => {
		const index = this.data.get('articles')
						.findIndex(
							a => a.get('id') === id
						);
		this.data = this.data.update(
			'articles', a => a.delete(index),
		);
	}
	
	onClickToggle = (id) => {
		const index = this.data.get('articles')
						.findIndex(
							a => a.get('id') === id
						);
		this.data = this.data.update(
			'articles',
			articles => articles.update(
				index,
				a => a.set('display', a.get('display') ? '' : 'none')
			)
		);
	}

	render() {
		const { articles, title, summary, } = this.data.toJS();
		return (
			<section>
				<header>
					<h1>Articles</h1>
					<input
						placeholder="Title"
						value={title}
						onChange={this.onChangeTitle}
					/>
					<input
						placeholder="Summary"
						value={summary}
						onChange={this.onChangeSummary}
					/>
					<button onClick={this.onClickAdd}>Add</button>
				</header>
				<article>
					<ul>
						{articles.map(i => (
							<li key={i.id}>
								<a href="#"
									onClick={this.onClickToggle
										.bind(null, i.id)}>
									{i.title}
								</a>
								&nbsp;
								<a href="#"
									onClick={this.onClickRemove
										.bind(null, i.id)}>
									x
								</a>	
								<p style={{display: i.display}}>
									{i.summary}
								</p>
							</li>	
						))}
					</ul>
				
				</article>
			</section>
		);
	}
}


export default Article