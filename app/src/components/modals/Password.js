import React, { Component } from 'react'
import cookie from 'react-cookies'
import Autocomplete from 'react-autocomplete';
import { findDOMNode } from 'react-dom'

import { getRequest, getModalConfig, logout } from '../../api/API'
import {UserContext} from '../../context/User'
import { UserSex } from '../../core/Const'
import  { fileUploadA11y } from '../../core/Utils'

const Config = require('Config');

export default class Password extends Component {
	constructor(props) {
		super(props);
		
		this.state = {
			form: {
				password: '',
				password_confirmation: '',
				current_password: '',
			}, 
			error: undefined,
			errors: [],
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

		let { link, obj } = getRequest( 'password' );
		
		const data = new FormData();
		
		['password', 'password_confirmation', 'current_password'].map((el) => {
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
						this.props.closeHandler(this.props.data.id)
					}
					
				},
				(error) => {
					this.setState({ error: error });
				}
			);
	}

	render() {
		const { user } = this.context;

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
					<div className="wnd-title">CHANGE PASSWORD</div>
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
				<form onSubmit={this.handleSubmit}>
				<div className="obj-body wnd-body">
					<div className="wnd-content">
						<main className="wnd-main">
							<div className="scroll-container">
								<div className="container">
									<div className="my-info">
										<div className="my-info-group">
											<div className="my-info-field">
												<label className="sr-only" htmlFor="password">New password</label>
												<input className="form-control form-control--flat" type="password" placeholder="New password" autoComplete="new-password" id="password" name="password" value={ this.state.form.password } onChange={this.handleChange} />
												{ this.showErrors('password') }
											</div>
										</div>
										<div className="my-info-group">
											<div className="my-info-field">
												<label className="sr-only" htmlFor="password_confirmation">New password confirm</label>
												<input className="form-control form-control--flat" type="password" placeholder="New password confirm" autoComplete="new-password" id="password_confirmation" name="password_confirmation" value={ this.state.form.password_confirmation } onChange={this.handleChange} />
												{ this.showErrors('password_confirmation') }
											</div>
										</div>
										<div className="my-info-group">
											<div className="my-info-field">
												<label className="sr-only" htmlFor="current_password">Current password</label>
												<input className="form-control form-control--flat" type="password" placeholder="Current password" autoComplete="new-password" id="current_password" name="current_password" value={ this.state.form.current_password } onChange={this.handleChange} />
												{ this.showErrors('current_password') }
											</div>
										</div>
										<div className="auth-form-submit">
											<button className="btn btn-default" type="submit">Change</button>
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

Password.contextType = UserContext;
