import React, { Component } from 'react'

import { getRequest } from '../../../../api/API'

const Config = require('Config');

export default class PasswordReset extends Component {
	constructor(props) {
		super(props);
		
		this.state = { 
			email: '',
			success: false,
			error: null,
			postInProgress: false
		};
		
		this.okHandler = this.okHandler.bind(this);
		this.closeHandler = this.closeHandler.bind(this);
		this.changeHandler = this.changeHandler.bind(this);
		
	}
	
	okHandler () {
		if ( this.state.postInProgress ) {
			return false;
		}
		
		this.setState({ postInProgress: true, error: null });
		
		let { link, obj } = getRequest( 'password_reset' );
		
		const data = new FormData();
		data.append('email', this.state.email);
		
		obj['body'] = data;

		fetch(link, obj)
			.then((res) => {
				return res.json();
			})
			.then(
				(result) => {
					if ( result.result == 'error' ) {
						this.setState({ postInProgress: false, error: result.errors[0].descriptions[0].message})
					}
					else {
						this.setState({ postInProgress: false, success: true });
					}
					
				},
				(error) => {
					this.setState({ postInProgress: false, error: error });
				}
			);
	}

	closeHandler () {
		this.props.closeHandler(this.props.data.id);
	}
	
	changeHandler(e) {
		this.setState({
			email: event.target.value,
			error: null,
		});
	}
	
	render() {
		return (
		<div className="obj dlg" id="dlg-report-profile" id={ 'window-' + this.props.data.id } data-key={ this.props.data.id }>
			<header className="obj-header dlg-header">
				<div className="dlg-title">{this.state.success ? 'Attention!' : 'Error'}</div>
			</header>
			<div className="obj-body dlg-body">
				{
					this.state.success ?
				<div className="dlg-content">
					<div className="dlg-query">A new password has been sent to your email.</div>
					<div className="dlg-query">To activate it, you need to click on the link in the email with a new password.</div>
					<div className="dlg-actions">
						<button className="btn btn-default btn-default--light" type="button" onClick={this.closeHandler}>OK</button>
					</div>
				</div>
					:
				<div className="dlg-content">
					<div className="dlg-query">If you forget your password,</div>
					<div className="dlg-form">
						<input className="form-control form-control--flat" type="text" value={this.state.email} onChange={this.changeHandler}/>
						{
							this.state.error ? 
						<div className="invalid-feedback">{this.state.error}</div>
							:
							''
						}
					</div>
					<div className="dlg-actions">
						<button className="btn btn-default btn-default--light" type="button" onClick={this.okHandler}>Continue</button>
					</div>
				</div>
				}
			</div>
		</div>
		);
	}
}
