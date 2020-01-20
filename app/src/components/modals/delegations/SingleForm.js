import React, { Component } from 'react'
import cookie from 'react-cookies'
import Autocomplete from 'react-autocomplete';

import { getRequest, getModalConfig } from '../../../api/API'

const Config = require('Config');

export default class SingleDelegationForm extends Component {
	constructor(props) {
		super(props);
		
		this.state = {
			form: {
				username: '',
				user_id: undefined,
			},
			document: undefined,
			isLoaded: false,
			error: undefined,
			errors: [],
			usersSearch: [],
			postInProgress: false
		};

		this.handleSubmit = this.handleSubmit.bind(this);

		this.onUserChange = this.onUserChange.bind(this);
		this.onUserSelect = this.onUserSelect.bind(this);
		this.getUserValue = this.getUserValue.bind(this);
		this.renderUserItem = this.renderUserItem.bind(this);
		this.retrieveDataAsynchronously = this.retrieveDataAsynchronously.bind(this);
	}

	componentWillMount() {
		const { link, obj } = getRequest('offer', this.props.data.pageId);
		
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
					if ( result.result == 'error' ) {
						this.setState({ isLoaded: true, error: result.errors[0].descriptions[0].message });
					}
					else {
						this.setState({ isLoaded: true, document: result });
					}
				},
				(error) => {
					this.setState({ isLoaded: true, error: error });
				}
			);
	}

	handleSubmit(event) {
		event.preventDefault();

		if ( this.state.postInProgress ) {
			return false;
		}

		const form = this.state.form;

		let { link, obj } = getRequest( this.props.data.action );
		
		if ( !form.username.length ) {
			form['user_id'] = undefined;
		}
		
		const data = new FormData();
		data.append('delegate_id', form.user_id);
		
		if ( this.state.isLoaded ) {
			data.append('project_id', this.state.document.project.id);
			data.append('category_id', this.state.document.category.id);
			data.append('offer_id', this.state.document.id);
		}
		
		console.log(form);
		obj['body'] = data;

		fetch(link, obj)
			.then((res) => {
				return res.json();
			})
			.then(
				(result) => {
		console.log(result);
					if ( result.result == 'error' ) {
						this.setState({ postInProgress: false, errors: result.errors})
					}
					else {
						this.props.showMessageHandler({ title: 'Syccess', message: "Votes successfully delegated" });
						this.props.closeHandler(this.props.data.id);
					}
					
				},
				(error) => {
					this.setState({ postInProgress: false, error: error });
				}
			);
	}
	
	render() {
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
						{this.showErrors('project_id', 'invalid-feedback--heading')}
						{this.showErrors('category_id', 'invalid-feedback--heading')}
						{this.showErrors('offer_id', 'invalid-feedback--heading')}
						<div className="container">
							<div className="my-info-group">
								<div className="my-info-field">
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
									{ this.showErrors('delegate_id') }
								</div>
							</div>
							{ this.state.isLoaded ?
							<div className="form-layout form-layout--reverse form-layout--about">
								<div className="form-layout__side">
									<div className="entry-buttons">
										<span className="entry-button-group">
											<button onClick={this.handleSubmit} className="btn btn-default" type="button">Delegate</button>
										</span>
									</div>
								</div>
							</div>
								:
							''
							}
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
