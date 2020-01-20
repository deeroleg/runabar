import React, { Component } from 'react'
import cookie from 'react-cookies'

import { getRequest } from '../../../api/API'

const Config = require('Config');

export default class DelegationsList extends Component {
	constructor(props) {
		super(props);
		this.state = { 
			project_id: undefined,
			projectsList: [],
			delegations: {},
			loadInProcess: false,
		};
	
		this.handleChangeDelegationProject = this.handleChangeDelegationProject.bind(this);
		this.loadProjects = this.loadProjects.bind(this);
		this.loadDelegations = this.loadDelegations.bind(this);
		this.delegationsTree = this.delegationsTree.bind(this);
		this.removeDelegation = this.removeDelegation.bind(this);
		this.doRemoveDelegation = this.doRemoveDelegation.bind(this);
	}

	componentDidMount() {
		this.loadProjects();
	}

	handleChangeDelegationProject(event) {
		this.setState({
			project_id: event.target.value,
			delegations: {},
			loadInProcess: false,
		});

		const _this = this;
		setTimeout(function() { _this.loadDelegations() }, 0);
	}
	
	loadDelegations() {
		if ( !this.state.loadInProcess ) {
			if ( this.state.project_id ) {
				this.setState( { loadInProcess: true } );

				let { link, obj } = getRequest('user_delegations_tree');

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
							if ( result.delegations ) {
								newState['delegations'] = result.delegations;
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
	
	removeDelegation(event) {
		event.preventDefault();
		this.props.showDialogHandler("Do you really want to remove delegation?", this.doRemoveDelegation, $(event.currentTarget).attr('data-delegation-id'));
	}
	
	doRemoveDelegation(objId) {
		if ( !this.state.loadInProcess ) {
			this.setState( { loadInProcess: true } );
			let { link, obj } = getRequest('remove_delegation');

			const data = new FormData();
			data.append('delegation_id', objId);
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
						this.loadDelegations();
					}
				);
		}
	}
	  
	render() {
		return (
			<div className="scroll-container">
				<div className="container">
					<div className="my-info-group">
						<div className="my-info-field">
							{this.state.delegations.length}
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
			{ !this.state.project_id || !this.state.delegations || !Object.keys(this.state.delegations).length ?
					<p>No delegations</p>
			:
					this.delegationsTree()
			}
				</div>
			</div>
		);
	}
	
	delegationsTree() {
		return (
			<div>
			{
				this.state.delegations.all && this.state.delegations.all.length ?
				<div>
					<h3>Delegeted all</h3>
				{
					this.state.delegations.all.map((item, key) => (
					<div key={key} className="chat-msg">
						<div className="chat-msg__date">
							{ 
								item.delegate ?
								<a href="#" onClick={this.props.modalByClickHandler} data-modal-action="profile" data-page-id={item.delegate.id}>{item.delegate.nickname}</a>
								: 'deleted'
							}
							 &nbsp;<a href="#" onClick={this.removeDelegation} data-delegation-id={item.id} title="Remove delegation">&times;</a>
						</div>
					</div>
					))
				}
				</div>
				: ''
			}
			{
				this.state.delegations.categories && this.state.delegations.categories.length ?
				<div>
					<h3>Categories</h3>
				{
					this.state.delegations.categories.map((item, key) => (
					<div key={key} className="chat-msg">
						<div className="chat-msg__date">
							{ 
								item.delegate ?
								<a href="#" onClick={this.props.modalByClickHandler} data-modal-action="profile" data-page-id={item.delegate.id}>{item.delegate.nickname}</a>
								: 'deleted'
							}
							 &nbsp;<a href="#" onClick={this.removeDelegation} data-delegation-id={item.id} title="Remove delegation">&times;</a>
						</div>
						<div className="chat-msg__body">{item.category.name}</div>
					</div>
					))
				}
				</div>
				: ''
			}
			{
				this.state.delegations.offers && this.state.delegations.offers.length ?
				<div>
					<h3>Particular votings</h3>
				{
					this.state.delegations.offers.map((item, key) => (
					<div key={key} className="chat-msg">
						<div className="chat-msg__date">
							{ 
								item.delegate ?
								<a href="#" onClick={this.props.modalByClickHandler} data-modal-action="profile" data-page-id={item.delegate.id}>{item.delegate.nickname}</a>
								: 'deleted'
							}
							 &nbsp;<a href="#" onClick={this.removeDelegation} data-delegation-id={item.id} title="Remove delegation">&times;</a>
						</div>
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
