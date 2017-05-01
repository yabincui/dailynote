import React, { Component } from 'react';
import { fromJS } from 'immutable';

import axios from 'axios';
import Radium from 'radium';

import { getAllUrlParams } from './GetUrlParams';


var styles = {
	title: {
		fontFamily: 'Courier New, Courier, monospace',
		color: '#cca78d',
		fontWeight: 'bold',
		fontSize: '30px',
		textAlign: 'center',
	},
	task: {
		fontFamily: 'Courier New, Courier, monospace',
		color: '#cca78d',
		fontSize: '20px',
		textAlign: 'left',
		
	},
	
	td: {
		border: '1px solid #777777',
		padding: '10px',
		color: '#cca78d',
	},
	
	tdA: {
		textDecoration: 'none',
		backgroundColor: '#b5ef9b',
		color: 'white',
		padding: '10px',
		margin: '20px',
	}
}

class NoteElement extends Component {
	
	state = {
		data: fromJS({
			note_id: '',
			user_id: '',
			date_time: '',
			state: '',
			priority: '',
			title: '',
			task: '',
			parent_note_id: '',
			children_note_ids: [],
		}),
	}
	
	get data() {
		return this.state.data;
	}
	
	set data(data) {
		this.setState({ data });
	}

	componentDidMount() {
		console.log('componentDidMount, props = ');
		console.dir(this.props);
		let note_id = '';
		if ('note_id' in this.props) {
			note_id = this.props.note_id;
		}
		this.data = this.data.set('note_id', note_id);
		console.log('note_id = ' + note_id);
		if (note_id) {
			console.log('get_note');
			axios.get('/get_note', {
				params: {
					note_id: note_id,
				},
			})
			.then(this.updateNote);
		}
	}
	
	updateNote = (response) => {
		console.log('get response data, status = ' + response.status);
		if (response.status !== 200) {
			return;
		}
		response = response.data;
		console.log('response.data = ' + response);
		console.dir(response);
		console.dir(this);
		let a = this.state.data.toJS();
		console.dir(a);
		let note_id = a.note_id;
		if (response.note_id != note_id) {
			console.log('note_id mismatch, need = ' + note_id + ", real " + response.note_id);
			return;
		}
		this.data = fromJS(response);
	}
	
	onStateSwitch = () => {
		this.setState((prevState, props) => {
			let obj = prevState.data.toJS();
			obj.state = (obj.state == 'TODO' ? 'DONE' : 'TODO');
			this.uploadNoteChange(obj);
			return { data: fromJS(obj) };
		});
	}
	
	onPriorityChange = (event) => {
		let value = event.target.value;
		this.setState((prevState, props) => {
			let obj = prevState.data.toJS();
			obj.priority = value;
			this.uploadNoteChange(obj);
			return { data: fromJS(obj) };
		});
	}
	
	onTitleChange = (event) => {
		let value = event.target.value;
		this.setState((prevState, props) => {
			let obj = prevState.data.toJS();
			obj.title = value;
			this.uploadNoteChange(obj);
			return { data: fromJS(obj) };
		});
	}
	
	onTaskChange = (event) => {
		let value = event.target.value;
		this.setState((prevState, props) => {
			let obj = prevState.data.toJS();
			obj.task = value;
			this.uploadNoteChange(obj);
			return { data: fromJS(obj) };
		});
	}
	
	onTagChange = (event) => {
		let value = event.target.value;
		this.setState((prevState, props) => {
			let obj = prevState.data.toJS();
			obj.tag = value;
			this.uploadNoteChange(obj);
			return { data: fromJS(obj) };
		});
	}
	
	uploadNoteChange = (note) => {
		console.log('uploadNoteChange:');
		console.dir(note);
		let data = new FormData();
		data.append('note_id', note.note_id);
		data.append('title', note.title);
		data.append('task', note.task);
		data.append('state', note.state);
		data.append('priority', note.priority);
		data.append('tag', note.tag);
		axios.post('/change_note', data);
	}
	
	render() {
		
		let note = this.data.toJS();
		console.log('NoteElement.render');
		console.dir(this.data.toJS());
		
		let parent_row = null;
		if (note.parent && note.parent.note_id) {
			parent_row = (<tr>
					<td>Parent</td>
					<td><a href={"change_note_form?note_id=" + note.parent.note_id}
							style={styles.tdA}>
						{note.parent.title}</a></td>
				</tr>);
		}
		let children_row = null;
		if (note.children) {
			children_row = (
				<tr>
					<td>Children</td>
					<td>{
						note.children.map((child) => (
							<a href={"change_note_form?note_id=" + child.note_id}
								style={styles.tdA}>
							{child.title}
							</a>
						))
					}</td>
				</tr>
			);
		}
		let state_row = (
			<tr>
				<td> State </td>
				<td>
					<button onClick={this.onStateSwitch}>{note.state}</button>
				</td>
			</tr>
		);
		
		let priority_row = (
			<tr>
				<td> Priority </td>
				<td>
					<select value={note.priority} onChange={this.onPriorityChange}>
						<option value="P1">P1</option>
						<option value="P2">P2</option>
						<option value="P3">P3</option>
						<option value="P4">P4</option>
					</select>
				</td>
			</tr>
		);

		let title_row = (
			<tr>
				<td> Title </td>
				<td>
					<input style={styles.title} class="title" type="text" name="title" size="30" value={note.title}
						onChange={this.onTitleChange} />
				</td>
			</tr>
		);
		
		let task_rows = note.task.split('\n').length + 1;
		
		let task_row = (
			<tr>
				<td> Task </td>
				<td>
					<textarea rows={task_rows} cols="60" style={styles.task} value={note.task}
						onChange={this.onTaskChange} />
				</td>
			</tr>
		);
		
		let tag_row = (
			<tr>
				<td> Tag (sep by ',') </td>
				<td>
					<input type="text" style={styles.title} value={note.tag}
						onChange={this.onTagChange} />
				</td>
			</tr>
		);
		
		let link_row = (
			<tr>
				<td> Links </td>
				<td>
					<a href={"add_note_form?parent_note_id=" + note.note_id}
						style={styles.tdA}>
						Add Sub Note</a>
					<a href={"delete_note?note_id=" + note.note_id}
						style={styles.tdA}>
						Delete Note</a>
				</td>
			</tr>
		);
		

		return (
			<section>
			<table width="100%">
				<col width="20px" />
				<tr>
					<td>Date</td>
					<td>{ note.date_time }</td>
				</tr>
				{ state_row }
				{ priority_row }
				{ title_row }
				{ task_row }
				{ tag_row }
				{ parent_row }
				{ children_row }
				{ link_row }
				
			</table>
			</section>
		);
	}
}

var NoteElementWrapper = Radium(NoteElement);

class ChangeNotePage extends Component {

	componentDidMount() {
		console.log('ChangeNotePage.componentDidMount, props = ')
		console.dir(this.props);
	}

	render() {
	
		let url_param_str = this.props.location.search;
		let param_obj = getAllUrlParams(url_param_str)
	
		return (
			<NoteElementWrapper note_id={param_obj.note_id}/>
		);
	}
}

class ListNotePage extends Component {

	state = {
		data: fromJS({
			tag: '',
			note_ids: [],
		}),
	}
	
	get data() {
		return this.state.data;
	}
	
	set data(data) {
		this.setState({ data });
	}
	
	componentDidMount() {
		console.log('ListNotePage.componentDidMount, props = ')
		console.dir(this.props);
		let url_param_str = this.props.location.search;
		console.log('url_param_str: ' + url_param_str);
		let param_obj = getAllUrlParams(url_param_str);
		let tag = 'ALL';
		if ('tag' in param_obj) {
			tag = param_obj.tag;
		}
		
		console.log('tag = ' + tag);
		this.data = this.data.set('tag', tag);
	
		axios.get('/get_note_ids', {
			params: {
				tag: tag,
			},
		})
		.then(this.updateNote);
	}
	
	updateNote = (response) => {
		console.log('get response data, status = ' + response.status);
		if (response.status !== 200) {
			return;
		}
		response = response.data;
		console.log('response.data = ' + response);
		console.dir(response);
		this.setState((prevState, props) => {
			let obj = prevState.data.toJS();
			obj.note_ids = response.note_ids;
			return {data: fromJS(obj)};
		});
	}
	
	render() {
		const { note_ids } = this.data.toJS();
		console.log("ListNotePage.render, this.data = ");
		console.dir(this.data.toJS());
		return (
			<section>
				{note_ids.map(i => (
					<NoteElementWrapper note_id={i} />
				))}
			</section>
		);
	}
}

class NotePages extends Component {
	
}

NotePages.ChangeNotePage = Radium(ChangeNotePage);

NotePages.ListNotePage = Radium(ListNotePage);

export default Radium(NotePages);