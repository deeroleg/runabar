import React, { Component } from 'react'
import cookie from 'react-cookies'
import FacebookLogin from 'react-facebook-login/dist/facebook-login-render-props';
import GoogleLogin from 'react-google-login';

import { getRequest, getModalConfig } from '../../api/API'
import {UserContext} from '../../context/User'

const formDefaults = {
	type: 'email',
	email: '', 
	password: '', 
	password_confirmation: '',
	nickname: '', 
	accept_agreement: ''
};

const Config = require('Config');

export default class Authorization extends Component {
	constructor(props) {
		super(props);
		this.state = {
			form: Object.assign({}, formDefaults), 
			authorization: true,
			registration: false,
			error: undefined,
			errors: [],
			temporaryResponse: null,
		};

		this.handleChange = this.handleChange.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
		this.handleTab = this.handleTab.bind(this);
		this.responseFacebook = this.responseFacebook.bind(this);
		this.responseGoogle = this.responseGoogle.bind(this);
		this.doSNResponse = this.doSNResponse.bind(this);
	}
  
	handleChange(event) {
		const form = this.state.form;
		
		if ( event.target.type === 'checkbox' ) {
			form[event.target.name] = event.target.checked ? event.target.value : '';
		}
		else {
			form[event.target.name] = event.target.value;
		}
		this.setState({ form: form, errors: [] });
	}

	handleSubmit(event) {
		event.preventDefault();
		const form = this.state.form;

		let { link, obj } = getRequest( 'authorization' );
		
		link = link + event.target.getAttribute('action');

		const data = new FormData();
		
		['type', 'email', 'password', 'password_confirmation', 'nickname', 'accept_agreement', 'code'].map((el) => {
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
						cookie.save(Config.authCookieName, result.token, { path: '/' });
						const context = this.context;
						context.changeUser(result.user);
						
						this.props.closeHandler(this.props.data.id)
						
						if ( this.state.registration ) {
							this.props.modalHandler('intro');
						}

					}
					
				},
				(error) => {
					this.setState({ error: error });
				}
			);
	}

	handleTab(event) {
		if ( event.currentTarget.getAttribute('data-target') == 'registration' && !this.state.registration ) {
			this.setState({ form: Object.assign({}, formDefaults), errors: [], registration: true, authorization: false });
		}
		else if ( !this.state.authorization ) {
			this.setState({ form: Object.assign({}, formDefaults), errors: [], registration: false, authorization: true });
		}
	}
	
	doSNResponse(code) {
		let { link, obj } = getRequest( 'authorization' );
		
		link = link + 'authorization/';
		
		const data = this.state.temporaryResponse;
		
		if ( !data ) {
			data = new FormData();
		}
		
		if ( code ) {
			data.append('code', code);
		}
		
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
					else if ( result.result == 'email_already_exists' ) {
						this.props.showMessageHandler({ title: 'Error', message: 'Your E-mail is already present on the site. Please login with username and password' });
					}
					else if ( result.result == 'need_code' ) {
						this.props.showPromtHandler('You must pass invite code', 'code', this.doSNResponse);
					}
					else {
						cookie.save(Config.authCookieName, result.token, { path: '/' });
						const context = this.context;
						context.changeUser(result.user);
						
						this.props.closeHandler(this.props.data.id)
						
						if ( this.state.registration ) {
							this.props.modalHandler('intro');
						}

					}
					
				},
				(error) => {
					this.setState({ error: error });
				}
			);
	}

	responseGoogle(response) {
		const data = new FormData();
		data.append('type', 'google');
		data.append('access_token', response.accessToken);

		this.setState({ temporaryResponse: data });
		this.doSNResponse();
	}	
	responseFacebook(response) {
		const data = new FormData();
		data.append('type', 'facebook');
		data.append('access_token', response.accessToken);

		this.setState({ temporaryResponse: data });
		this.doSNResponse();
	}

	render() {
		return (
			<div className="obj wnd wnd--welcome" id={ 'window-' + this.props.data.id } data-key={ this.props.data.id }>
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
					<div className="wnd-title">Hello!</div>
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
				<div className="obj-body wnd-body">
					<div className="wnd-content">
						<main className="wnd-main">
							<div className="scroll-container">
								<div className="container">
									<div className="welcome-container">
										<div className="welcome-content">
											<div className="welcome-title">Welcome to Runubar!</div>
											<div className="welcome-text">
												<p>Some short text about this project you can read here, when Vanya Mitin will wright it, with his grate and briliant english.</p>
												<p>
													<button className="btn btn-info" type="button" data-toggle="tooltip" data-placement="top" title="Tooltip on top"><span className="btn__label">?</span></button> If you need more information, you can press this button.
												</p>
											</div>
										</div>
										<div className="welcome-form">
											<div className="auth-tabs nav" role="tablist">
												<button className={ this.state.registration ? 'btn auth-tabs__btn active' : 'btn auth-tabs__btn' } onClick={this.handleTab} data-target="registration" type="button"><span className="btn-tab-wrapper"><span className="btn btn-tab"><img className="icon icon-register" src="/i/general/icons/icon-register.svg" alt="Register icon" role="presentation" /></span></span><span className="btn-tab-label">Register</span></button>
												<button className={ this.state.authorization ? 'btn auth-tabs__btn active' : 'btn auth-tabs__btn' } onClick={this.handleTab} data-target="authorization" type="button"><span className="btn-tab-wrapper"><span className="btn btn-tab"><img className="icon icon-login" src="/i/general/icons/icon-login.svg" alt="Login icon" role="presentation"/></span></span><span className="btn-tab-label">Login</span></button>
											</div>
											<div className="auth-forms tab-content">
												<div className="tab-pane active" id="register" role="tabpanel" aria-labelledby="register-tab">
													{ this.state.registration ? this.registrationForm() : this.authorizationForm() }
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>
						</main>
					</div>
				</div>
			</div>
		);
	}
	
	registrationForm() {
		return <form className="auth-form" action="registration/" onSubmit={this.handleSubmit}>
			<div className="form-wrapper">
				<div className="form-outer">
					<div className="form-inner">
						<div className="form-group form-group--label-over">
							<input className="form-control" type="text" placeholder="Nickname" autoComplete="new-password" id="nickname" name="nickname" value={ this.state.form.nickname } onChange={this.handleChange}/>
							<label htmlFor="nickname">Nickname</label>
							{ this.showErrors('nickname') }
						</div>
						<div className="form-group form-group--label-over">
							<input className="form-control" type="text" placeholder="Email" id="email" name="email" value={ this.state.form.email } onChange={this.handleChange} autoComplete="new-password"/>
							<label htmlFor="email">Email</label>
							{ this.showErrors('email') }
						</div>
						<div className="form-group form-group--label-over">
							<input className="form-control" type="password" placeholder="Password" autoComplete="new-password" id="password" name="password" value={ this.state.form.password } onChange={this.handleChange}/>
							<label htmlFor="password">Password</label>
							{ this.showErrors('password') }
						</div>
						<div className="form-group form-group--label-over">
							<input className="form-control" type="password" placeholder="Repeat password" autoComplete="new-password" id="password_confirmation" name="password_confirmation" value={ this.state.form.password_confirmation } onChange={this.handleChange}/>
							<label htmlFor="password_conf">Repeat password</label>
							{ this.showErrors('password_confirmation') }
						</div>
						<div className="form-group form-group--label-over form-group--code">
							<input className="form-control" type="text" placeholder="Participation code" autoComplete="new-password" id="code" name="code" value={ this.state.form.code } onChange={this.handleChange}/>
							<label htmlFor="code">Participation code</label>
							{ this.showErrors('code') }
						</div>
						<div className="form-group checkbox-group">
							<label>
								<input type="checkbox" name="accept_agreement" value="accept" checked={ this.state.form.accept_agreement == 'accept' } onChange={this.handleChange}/>
								Accept agreement
							</label>
							{ this.showErrors('accept_agreement') }
						</div>
					</div>
				</div>
			</div>
			<div className="auth-form-submit">
				<button className="btn btn-default" type="submit">Continue</button>
			</div>
		</form>
	}
	
	authorizationForm() {
		return <form className="auth-form" action="authorization/" onSubmit={this.handleSubmit}>
			<div className="form-wrapper">
				<div className="form-outer">
					<div className="form-inner">
						<div className="form-group form-group--label-over">
							<input className="form-control" type="text" placeholder="Email" id="email" name="email" value={ this.state.form.email } onChange={this.handleChange} autoComplete="new-password"/>
							<label htmlFor="email">Email</label>
							{ this.state.error ? '<div className="invalid-feedback">' + this.state.error + '</div>' : '' }
							{ this.showErrors() }
						</div>
						<div className="form-group form-group--label-over">
							<input className="form-control" type="password" placeholder="Password" id="password" name="password" value={ this.state.form.password } onChange={this.handleChange} autoComplete="new-password"/>
							<label htmlFor="password">Password</label>
						</div>
						<div className="form-group form-group--oauth">
							<FacebookLogin
								appId={Config.facebookAppID}
								callback={this.responseFacebook}
								render={renderProps => (
									<button className="btn btn-social" onClick={renderProps.onClick} type="button"><span className="btn__label btn__label--fb">f</span></button>
								)}
							/>
							<span className="btn-group-delim">or</span>
							<GoogleLogin
								clientId={Config.googleClientID}
								buttonText="Login"
								onSuccess={this.responseGoogle}
								onFailure={this.responseGoogle}
								render={renderProps => (
									<button className="btn btn-social" type="button" onClick={renderProps.onClick} disabled={renderProps.disabled}><span className="btn__label btn__label--gp">G+</span></button>
								)}
								cookiePolicy={'single_host_origin'}
							/>
						</div>
						<div className="form-group">
							<a href="#" className="link-dashed" onClick={ this.props.modalByClickHandler } data-modal-action="password_reset">Forgot password?</a>
						</div>
					</div>
				</div>
			</div>
			<div className="auth-form-submit">
				<button className="btn btn-default" type="submit">Continue</button>
			</div>
		</form>
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



Authorization.contextType = UserContext;
