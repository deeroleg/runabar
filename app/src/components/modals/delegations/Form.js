import React, { Component } from 'react'
import cookie from 'react-cookies'
import { sprintf } from 'sprintf-js'
import { findDOMNode } from 'react-dom'
import Autocomplete from 'react-autocomplete';

import { getRequest, getModalConfig } from '../../../api/API'
import { DelegateContext } from '../../../context/Delegate'
import { DelegationTypeCategories, DelegationTypeAll } from '../../../core/Const'
import { fileUploadA11y } from '../../../core/Utils'
import DelegetionSelector from './DelegetionSelector'
import {UserContext} from '../../../context/User'

const Config = require('Config');

export default class DelegationForm extends Component {
	constructor(props) {
		super(props);
		
		this.updateType = (type) => {
			const form = this.state.form;
			
			form['type'] = type;
			form['clear_categories_delegations'] = false;
			form['clear_offers_delegations'] = false;
			form['category_id'] = [];
			
			this.setState({ form: form, errors: [] });
		}

		this.updateCategoriesList = (list) => {
			this.setState({ categoriesList: list });
		}
		
		this.state = {
			form: {
				project_id: undefined,
				username: '',
				user_id: undefined,
				category_id: [],
				type: DelegationTypeAll,
				clear_categories_delegations: false,
				clear_offers_delegations: false,
				delegate: undefined
			},
			projectsList: [],
			categoriesList: [],
			error: undefined,
			errors: [],
			usersSearch: [],
			updateType: this.updateType,
			updateCategoriesList: this.updateCategoriesList,
			postInProgress: false,
		};

		this.handleSubmit = this.handleSubmit.bind(this);
		this.loadProjects = this.loadProjects.bind(this);
		this.loadUser = this.loadUser.bind(this);
		this.handleChange = this.handleChange.bind(this);
		this.handleChangeCheckbox = this.handleChangeCheckbox.bind(this);
		this.handleChangeCategories = this.handleChangeCategories.bind(this);
		this.showErrors = this.showErrors.bind(this);

		this.onUserChange = this.onUserChange.bind(this);
		this.onUserSelect = this.onUserSelect.bind(this);
		this.getUserValue = this.getUserValue.bind(this);
		this.renderUserItem = this.renderUserItem.bind(this);
		this.retrieveDataAsynchronously = this.retrieveDataAsynchronously.bind(this);
	}

	componentDidMount() {
		this.loadProjects();
		this.loadUser();
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
					const form = this.state.form;
					
					this.setState({ projectsList: result.elements, form: form });
				},
				(error) => {
					const form = this.state.form;
					form.project_id = undefined;

					this.setState({ projectsList: [], form: form });
				}
			);
	}

	loadUser() {
		const { user } = this.context;
		
		if ( user.id != this.props.data.pageId ) {
			const { link, obj } = getRequest('profile', this.props.data.pageId);
			
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
						this.setState({ delegate: result });
					}
				);
		}
	}


	handleChange(event) {
		const form = this.state.form;
		
		form[event.target.name] = event.target.value;
		form.type = DelegationTypeAll;
		
		this.setState({ form: form, errors: [] });
	}

	handleChangeCheckbox(event) {
		const form = this.state.form;
		
		form[event.target.name] = event.target.checked;
		
		this.setState({ form: form, errors: [] });
	}

	handleChangeCategories(event) {
		const form = this.state.form;
		
		let category_id = form.category_id;
		let check = event.target.checked;
		let id = parseInt(event.target.value);

		if (check) {
			category_id = [...category_id, id]
		}
		else { 
			var index = category_id.indexOf(id);
			if ( index > -1 ) {
				category_id.splice(index, 1);
			} 
		}	
		form['category_id'] = category_id;
		
		this.setState({ form: form, errors: [] });
	}

	handleSubmit(event) {
		event.preventDefault();
		if ( this.state.postInProgress ) {
			return false;
		}

		const form = this.state.form;

		let { link, obj } = getRequest( this.props.data.action );

		const data = new FormData();
		
		if ( this.state.delegate ) {
			data.append('delegate_id', this.state.delegate.id);
		}
		else {
			if ( !form.username.length ) {
				form['user_id'] = undefined;
			}
			data.append('delegate_id', form.user_id);
		}
		
		data.append('project_id', form.project_id);
		form.category_id.forEach((el) =>  {
			data.append('category_id', el);
		})
		data.append('type', form.type);
		data.append('clear_offers_delegations', form.clear_offers_delegations ? 1 : 0);
		data.append('clear_categories_delegations', form.clear_categories_delegations ? 1 : 0);
		
		obj['body'] = data;

		fetch(link, obj)
			.then((res) => {
				return res.json();
			})
			.then(
				(result) => {
					if ( result.result == 'error' ) {
						this.setState({ postInProgress: false, errors: result.errors})
					}
					else {
						this.props.showMessageHandler({ title: 'Syccess', message: "Votes successfully delegated" });
						this.props.closeHandler(this.props.data.id);
					}

					this.updateCategoriesList(result.elements);
					
				},
				(error) => {
					this.setState({ postInProgress: false, error: error });
				}
			);
	}
	
	render() {
		const { user } = this.context;
		
		return (
			<div className="obj ent ent--modal ent--new" id={ 'window-' + this.props.data.id } data-key={ this.props.data.id }>
				<header className="obj-header ent-header">
					<div className="obj-control ent-control">
						<button className="btn btn-min btn-min--hide" type="button" title="Minimize"></button>
					</div>
					<div className="ent-title">
						Delegate vote
					</div>
					<div className="obj-control ent-control">
						<button className="btn btn-close" type="button" title="Close"></button>
					</div>
				</header>
				<div className="obj-body ent-body">
					<div className="ent-content">
						{this.showErrors('system', 'invalid-feedback--heading')}
						<div className="container">
							<div className="my-info-group">
								<div className="my-info-field">
									<select className="form-control" id="project_id" name="project_id" value={ this.state.form.project_id } onChange={this.handleChange}>
										<option value=''>Select project</option>
										{
											this.state.projectsList.map((item, key) => (
										<option key={key} value={item.id}>{item.name}</option>
											))
										}
									</select>
									{ this.showErrors('project_id') }
								</div>
								<div className="my-info-field">
								{
									user.id == this.props.data.pageId ?
									<Autocomplete
										inputProps={{className: "form-control form-control--flat", placeholder: 'User' }}
										wrapperStyle={{ display: 'block' }}
										getItemValue={this.getUserValue}
										items={this.state.usersSearch}
										renderItem={this.renderUserItem}
										value={this.state.form.username}
										onChange={this.onUserChange}
										onSelect={this.onUserSelect}
									/>
									:
									<p>{ this.state.delegate ? this.state.delegate.nickname : 'loadnig..' }</p>
								}
									{ this.showErrors('delegate_id') }
								</div>
							</div>
							{
								this.state.form.project_id  && (this.state.form.user_id || this.state.delegate) ?
							<DelegateContext.Provider value={this.state}>
								<DelegetionSelector projectId={this.state.form.project_id} userId={this.state.delegate ? this.state.delegate.id : this.state.form.user_id} changeHandler={this.handleChangeCheckbox} changeCategories={this.handleChangeCategories} modalByClickHandler={this.props.modalByClickHandler} errors={this.state.errors} showErrors={this.showErrors}/>
							</DelegateContext.Provider>
								:
							''
							}
							<div className="form-layout form-layout--reverse form-layout--about">
								<div className="form-layout__side">
									<div className="entry-buttons">
										<span className="entry-button-group">
											<button onClick={this.handleSubmit} className="btn btn-default" type="button">Delegate</button>
										</span>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}

	showErrors(key, addClass) {
		const className = addClass ? 'invalid-feedback ' + addClass : 'invalid-feedback';
		if ( key ) {
			return (
				<div> 
				{ this.state.errors.filter((element) => {
						return element.key === key;
					}).map((error, idx) => (
						<div key={idx} className={className}>{error.descriptions[0].message}</div>
				)) }
				</div>
			)
		}
		return (
			<div>
			{ this.state.errors.map((error, idx) => (
					<div key={idx} className={className}>{error.descriptions[0].message}</div>
			)) }
			</div>
		)
	}

/* User Autocompleter */
    retrieveDataAsynchronously(searchText){
        let _this = this;
		
		let { link, obj } = getRequest( 'users_search', searchText );
		
        let xhr = new XMLHttpRequest();
        xhr.open('GET', link, true);
        for ( var h in obj.headers ) {
			xhr.setRequestHeader(h, obj.headers[h]);
		}
        xhr.responseType = 'json';
        xhr.onload = () => {
            let status = xhr.status;

            if (status == 200) {
                _this.setState({
                    usersSearch: xhr.response.elements
                });
            }
        };

        xhr.send();
    }
    
    onUserChange(e){
		const form = this.state.form;
		
		form['username'] = e.target.value;
		form['user_id'] = undefined;
		form['type'] = DelegationTypeAll;
		
        this.setState({
            form: form
        });

        this.retrieveDataAsynchronously(e.target.value);
    }

    onUserSelect(val, item){
		const form = this.state.form;
		if ( item.id ) {
			form['user_id'] = item.id;
		}
		
		form['username'] = val;
		form['type'] = DelegationTypeAll;
		
        this.setState({
            form: form
        });

    }

    renderUserItem(item, isHighlighted){
        return (
            <div key={item.id} style={{ background: isHighlighted ? 'lightgray' : 'white' }}>
                {item.nickname}
            </div>   
        ); 
    }

    getUserValue(item){
        return `${item.nickname}`;
    }
/* User Autocompleter */

}

DelegationForm.contextType = UserContext;
