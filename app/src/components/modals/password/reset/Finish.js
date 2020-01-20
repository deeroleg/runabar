import React, { Component } from 'react'
import cookie from 'react-cookies'

import { getRequest } from '../../../../api/API'

const Config = require('Config');

export default class PasswordResetFinish extends Component {
	constructor(props) {
		super(props);
		this.state = {
			error: undefined,
			isLoaded: false,
		};
	}

	componentWillMount() {
		let { link, obj } = getRequest( 'password_reset_finish' );
		
		const data = new FormData();
		data.append('id', this.props.data.pageId);
		
		obj['body'] = data;

		fetch(link, obj)
			.then((res) => {
				return res.json();
			})
			.then(
				(result) => {
					if ( result.result == 'error' ) {
						this.setState({ isLoaded: true, error: result.error })
					}
					else {
						this.setState({ isLoaded: true });
					}
					
				},
				(error) => {
					this.setState({ isLoaded: true, error: error });
				}
			);
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
										<div>
											<div className="welcome-title">Password recovery!</div>
										{
											this.state.isLoaded ?
												this.state.error ?
											<div className="welcome-text">
												<p>{this.state.error}</p>
												<a href="#" className="link-dashed" onClick={ this.props.modalByClickHandler } data-modal-action="password_reset">Forgot password?</a>
											</div>
												:
											<div className="welcome-text">
												<p>Your new password has been successfully activated.</p>
												<a href="#" className="link-dashed" onClick={ this.props.modalByClickHandler } data-modal-action="authorization">Authorization</a>
											</div>
											:
											<div className="welcome-text">
												<p>Loading....</p>
											</div>
										}
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
}
