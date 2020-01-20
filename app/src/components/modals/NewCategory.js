import React, { Component } from 'react'
import cookie from 'react-cookies'
import { sprintf } from 'sprintf-js'

import { getRequest, getModalConfig } from '../../api/API'
import {UserContext} from '../../context/User'

const Config = require('Config');

export default class NewCategory extends Component {
	constructor(props) {
		super(props);
		
		this.state = {
			form: {
				name: ''
			}, 
			error: undefined,
			errors: []
		};

		this.handleChange = this.handleChange.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
	}

	handleChange(event) {
		const form = this.state.form;
		
		form[event.target.name] = event.target.value;
		this.setState({ form: form, errors: [] });
	}
	
	handleSubmit(event) {
		event.preventDefault();
		const form = this.state.form;

		let { link, obj } = getRequest( 'new-category' );
		
		link = link + event.target.getAttribute('action');

		const data = new FormData();

		['name'].map((el) => {
			if ( form[el] ) {
				data.append(el, form[el]);
			}
		});

		obj['body'] = data;

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
						this.setState({ errors: result.errors })
					}
					else {
						this.props.closeHandler(this.props.data.id);
						this.props.data.successHandler(this.props.data.projectId);

					}
					
				},
				(error) => {
					this.setState({ error: error });
				}
			);
	}

	render() {
		let formAction = this.props.data.categoryId ? 
			sprintf('categories/%s/subcategories/create/', this.props.data.categoryId) : 
			sprintf('projects/%s/categories/create/', this.props.data.projectId)
		
		return (
			<div className="obj wnd wnd--you" id={ 'window-' + this.props.data.id } data-key={ this.props.data.id }>
				<header className="obj-header wnd-header">
					<div className="obj-control wnd-control">
						<button className="btn btn-min btn-min--lg btn-min--hide" type="button" title="Minimize"></button>
					</div>
					<div className="wnd-header-bars wnd-header-bars--left">
						<div className="wnd-header-bar"></div>
						<div className="wnd-header-bar"></div>
						<div className="wnd-header-bar"></div>
						<div className="wnd-header-bar"></div>
						<div className="wnd-header-bar"></div>
					</div>
					<div className="wnd-title">Create {this.props.data.categoryId ? 'subcategory' : 'category'}</div>
					<div className="wnd-header-bars wnd-header-bars--right">
						<div className="wnd-header-bar"></div>
						<div className="wnd-header-bar"></div>
						<div className="wnd-header-bar"></div>
						<div className="wnd-header-bar"></div>
						<div className="wnd-header-bar"></div>
					</div>
					<div className="obj-control wnd-control">
						<button className="btn btn-close btn-close--lg" type="button" title="Close"></button>
					</div>
				</header>
				<form action={formAction} onSubmit={this.handleSubmit}>
				<div className="obj-body wnd-body">
					<div className="wnd-content">
						<main className="wnd-main">
							<div className="scroll-container">
								<div className="container">
									<div className="my-info">
										<div className="my-info-group">
											<div className="my-info-field">
												<label className="sr-only" htmlFor="name">Name</label>
												<input className="form-control form-control--flat" type="text" placeholder="Name" autoComplete="new-password" id="name" name="name" value={ this.state.form.name } onChange={this.handleChange} />
												{ this.showErrors('name') }
												{ this.showErrors('system') }
											</div>
										</div>
										<div className="auth-form-submit">
											<button className="btn btn-default" type="submit">Create</button>
										</div>
									</div>
								</div>
							</div>
						</main>
					</div>
				</div>
				</form>
			</div>
		);
	}

	showErrors(key) {
		if ( key ) {
			return (
				<div> 
				{ this.state.errors.filter((element) => {
						return element.key === key;
					}).map((error, idx) => (
						<div key={idx} className="invalid-feedback">{error.descriptions[0].message}</div>
				)) }
				</div>
			)
		}
		return (
			<div>
			{ this.state.errors.map((error, idx) => (
					<div key={idx} className="invalid-feedback">{error.descriptions[0].message}</div>
			)) }
			</div>
		)
	}
}
