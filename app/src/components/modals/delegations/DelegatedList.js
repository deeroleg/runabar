import React, { Component } from 'react'
import cookie from 'react-cookies'

import { getRequest } from '../../../api/API'

const Config = require('Config');

export default class DelegatedList extends Component {
	constructor(props) {
		super(props);
		this.state = { 
			project_id: undefined,
			projectsList: [],
			delegated: {},
			loadInProcess: false,
		};
	
		this.handleChangeDelegationProject = this.handleChangeDelegationProject.bind(this);
		this.loadProjects = this.loadProjects.bind(this);
		this.loadDelegations = this.loadDelegations.bind(this);
		this.delegatedTree = this.delegatedTree.bind(this);
	}

	componentDidMount() {
		this.loadProjects();
	}

	handleChangeDelegationProject(event) {
		this.setState({
			project_id: event.target.value,
			delegated: {},
			loadInProcess: false,
		});

		const _this = this;
		setTimeout(function() { _this.loadDelegations() }, 0);
	}
	
	loadDelegations() {
		if ( !this.state.loadInProcess ) {
			if ( this.state.project_id ) {
				this.setState( { loadInProcess: true } );

				let { link, obj } = getRequest('user_delegated_tree');

				const data = new FormData();
				data.append('project_id', this.state.project_id);
				obj['body'] = data;

				fetch(link, obj)
					.then((res) => {
						if ( res.status == 401 ) {
							cookie.remove(Config.authCookieName, { path: '/' });
							this.props.changeUserHandler({});
						}
						this.setState( { loadInProcess: false } );
						return res.json();
					})
					.then(
						(result) => {
							const newState = { loadInProcess: false };
							if ( result.delegated ) {
								newState['delegated'] = result.delegated;
							}
							this.setState(newState);
						}
					);
			}
			else {
				this.setState( { delegations: {} } );
			}
		}
	}

	loadProjects() {
		const { link, obj } = getRequest('projects');
		
		fetch(link, obj)
			.then((res) => {
				if ( res.status == 401 ) {
					cookie.remove(Config.authCookieName, { path: '/' });
					this.props.changeUserHandler({});
				}
				return res.json();
			})
			.then(
				(result) => {
					this.setState({ projectsList: result.elements, project_id: undefined });
				},
				(error) => {
					this.setState({ project_id: undefined, projectsList: [], form: form });
				}
			);
	}
	  
	render() {
		return (
			<div className="scroll-container">
				<div className="container">
					<div className="my-info-group">
						<div className="my-info-field">
							{this.state.delegated.length}
							<select className="form-control" id="project_id" name="project_id" value={ this.state.project_id } onChange={this.handleChangeDelegationProject}>
								<option value=''>Select project</option>
								{
									this.state.projectsList.map((item, key) => (
								<option key={key} value={item.id}>{item.name}</option>
									))
								}
							</select>
						</div>
					</div>
			{ !this.state.project_id || !this.state.delegated || !Object.keys(this.state.delegated).length ?
					<p>No delegated votes</p>
			:
					this.delegatedTree()
			}
				</div>
			</div>
		);
	}
	
	delegatedTree() {
		return (
			<div>
			{
				this.state.delegated.all && this.state.delegated.all.length ?
				<div>
					<h3>All votes</h3>
				{
					this.state.delegated.all.map((item, key) => (
					<div key={key} className="chat-msg">
					{ 
						item.user ?
						<div className="chat-msg__date">
							by <a href="#" onClick={this.props.modalByClickHandler} data-modal-action="profile" data-page-id={item.user.id}>{item.user.nickname}</a>
						</div>
						: 
						<div className="chat-msg__date">deleted</div>
					}
					</div>
					))
				}
				</div>
				: ''
			}
			{
				this.state.delegated.categories && this.state.delegated.categories.length ?
				<div>
					<h3>Categories</h3>
				{
					this.state.delegated.categories.map((item, key) => (
					<div key={key} className="chat-msg">
					{ 
						item.user ?
						<div className="chat-msg__date">
							by <a href="#" onClick={this.props.modalByClickHandler} data-modal-action="profile" data-page-id={item.user.id}>{item.user.nickname}</a>
						</div>
						: 
						<div className="chat-msg__date">deleted</div>
					}
						<div className="chat-msg__body">{item.category.name}</div>
					</div>
					))
				}
				</div>
				: ''
			}
			{
				this.state.delegated.offers && this.state.delegated.offers.length ?
				<div>
					<h3>Particular votes</h3>
				{
					this.state.delegated.offers.map((item, key) => (
					<div key={key} className="chat-msg">
					{ 
						item.user ?
						<div className="chat-msg__date">
							by <a href="#" onClick={this.props.modalByClickHandler} data-modal-action="profile" data-page-id={item.user.id}>{item.user.nickname}</a>
						</div>
						: 
						<div className="chat-msg__date">deleted</div>
					}
						<div className="chat-msg__body">{item.offer.category.name} >> {item.offer.name}</div>
					</div>
					))
				}
				</div>
				: ''
			}
			</div>
		);
	}
	
}
