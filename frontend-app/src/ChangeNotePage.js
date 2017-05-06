import React, { Component } from 'react';
import { fromJS } from 'immutable';

import axios from 'axios';
import Radium from 'radium';

import { getAllUrlParams } from './GetUrlParams';


var styles = {

	ul: {
		listStyleType: 'none',
		margin: '0',
		padding: '0',
		overflow: 'hidden',
		fontSize: '15px',
	},
	
	li: {
		float: 'left',
	},

	liMenu: {
		display: 'block',
		color: 'white',
		textAlign: 'center',
		textDecoration: 'none',
		backgroundColor: '#b2dcf5',
		padding: '16px',
		margin: '5px 5px 5px 5px',
		height: '20px',
	},
	
	liA: {
		display: 'block',
		color: 'white',
		textAlign: 'center',
		textDecoration: 'none',
		backgroundColor: '#b5ef9b',
		padding: '16px',
		margin: '5px 5px 5px 5px',
		height: '20px',
		
		':hover': {
			backgroundColor: '#b2dcf5',
		},
	},
	
	

	borderTable: {
		border: '5px solid #c4d9c6',
	},
	
	noBorderTable: {
		border: '0',	
	},

	title: {
		fontFamily: 'Courier New, Courier, monospace',
		color: '#cca78d',
		fontWeight: 'bold',
		fontSize: '30px',
		textAlign: 'center',
		width: '99%',
	},
	
	noPaddingTr: {
		border: '0',
		padding: '0',
	},
	
	task: {
		fontFamily: 'Courier New, Courier, monospace',
		color: '#cca78d',
		fontSize: '20px',
		textAlign: 'left',
		width: '99%',
		
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
		padding: '8px',
		margin: '20px',
	},

	tdZeroWidth: {
		width: '0%',
	},
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
	
	
	onSharedUsersChange = (event) => {
		let value = event.target.value;
		this.setState((prevState, props) => {
			let obj = prevState.data.toJS();
			obj.shared_users = value;
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
		data.append('shared_users', note.shared_users);
		axios.post('/change_note', data);
	}
	
	render() {
		
		let note = this.data.toJS();
		console.log('NoteElement.render');
		console.dir(this.data.toJS());

		let date_row = (
			<tr>
				<td>Date</td>
				<td>{ note.date_time.substring(0, note.date_time.indexOf('.')) }</td>
			</tr>
		);

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
		if (note.children && note.children.length > 0) {
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
		
		let shared_users_row = (
			<tr>
				<td> Shared users </td>
				<td style={styles.noPaddingTr}>
					<input style={styles.title} type="text" value={note.shared_users}
						onChange={this.onSharedUsersChange} />
				</td>
			</tr>
		);

		let title_row = (
			<tr>
				<td> Title </td>
				<td style={styles.noPaddingTr}>
					<input style={styles.title} class="title" type="text" name="title" size="30" value={note.title}
						onChange={this.onTitleChange} />
				</td>
			</tr>
		);
		
		let task_rows = note.task.split('\n').length + 1;
		
		let task_row = (
			<tr style={styles.noPaddingTr}>
				<td style={styles.noPaddingTr}>
					<textarea rows={task_rows} style={styles.task} value={note.task}
						onChange={this.onTaskChange} />
				</td>
			</tr>
		);
		
		let tag_row = (
			<tr>
				<td> Tag (sep by ',') </td>
				<td style={styles.noPaddingTr}>
					<input type="text" style={styles.title} value={note.tag}
						onChange={this.onTagChange} />
				</td>
			</tr>
		);
		
		let link_row = (
			<tr>
				<td> Links </td>
				<td>
					<a href={"change_note_form?note_id=" + note.note_id}
						style={styles.tdA}>
						Change Note</a>
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
			<table width="100%" style={styles.borderTable}>
			  <table width="100%" style={styles.noBorderTable}>
				<col width="20px" />
				{ date_row }
				{ state_row }
				{ priority_row }
				{ title_row }
				{ tag_row }
				{ parent_row }
				{ children_row }
				{ shared_users_row }
				{ link_row }
			  </table>
			  
			  <table width="100%" style={styles.noBorderTable}>
			  	{task_row}
			  </table>
				
			</table>
			</section>
		);
	}
}

var NoteElementWrapper = Radium(NoteElement);


class TagsElement extends Component {


	tagToJSX = (tag, need_tag) => {
		let li_content = null;
		if (tag == need_tag) {
			li_content = (<span style={styles.liMenu}>{tag}</span>);
		} else if (tag == 'ALL') {
			li_content = (<a style={styles.liA} key={tag} href="list_notes">{tag}</a>);
		} else {
			li_content = (<a style={styles.liA} key={tag} href={"list_notes?tag=" + tag}>{tag}</a>);
		}
		return (<li style={styles.li}>{li_content}</li>);
	}
	
	render() {
		let tags = this.props.tags
		let need_tag = this.props.need_tag
		
		let all_tag_item = this.tagToJSX('ALL', need_tag);
		
		let tag_items = tags.map(tag => this.tagToJSX(tag, need_tag));
		
		
		return (
			<section>
				<ul style={styles.ul}>
					{all_tag_item}
					{tag_items}
				</ul>
				
			</section>
		);
	}
}

var TagsElementWrapper = Radium(TagsElement);

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
			need_tag: '',
			tags: [],
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
		this.data = this.data.set('need_tag', tag);
	
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
			obj.tags = response.tags;
			return {data: fromJS(obj)};
		});
	}
	
	render() {
		const { need_tag, tags, note_ids } = this.data.toJS();
		console.log("ListNotePage.render, this.data = ");
		console.dir(this.data.toJS());
		return (
			<section>
				<TagsElementWrapper tags={tags} need_tag={need_tag} />
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