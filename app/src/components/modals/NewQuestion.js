import React, { Component } from 'react'
import cookie from 'react-cookies'
import { sprintf } from 'sprintf-js'

import { getRequest, getModalConfig } from '../../api/API'
import {UserContext} from '../../context/User'

const Config = require('Config');

export default class NewQuestion extends Component {
	constructor(props) {
		super(props);
		
		this.state = {
			form: {
				question: ''
			}, 
			error: undefined,
			errors: []
		};

		this.handleChange = this.handleChange.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
	}

	handleChange(event) {
		const form = this.state.form;
		
		form.question = event.target.value;
		this.setState({ form: form, errors: [] });
	}
	
	handleSubmit(event) {
		event.preventDefault();
		const form = this.state.form;

		let { link, obj } = getRequest( 'new-question' );

		const data = new FormData();

		['question'].map((el) => {
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
						this.props.showMessageHandler({ title: 'Success', message: 'Your question is successfully accepted' });

					}
					
				},
				(error) => {
					this.setState({ error: error });
				}
			);
	}

	render() {
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
					<div className="wnd-title">Create question</div>
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
									<div className="my-info-group">
										<div className="my-info-field entry-about">
											<label className="sr-only" htmlFor="about">Question</label>
											<textarea className="form-control" rows="4" type="text" id="question" placeholder="Question" name="question" value={ this.state.form.question } onChange={this.handleChange}/>
											{ this.showErrors('question') }
											{ this.showErrors('system') }
										</div>
									</div>
									<div className="auth-form-submit">
										<button className="btn btn-default" type="submit">Send</button>
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
