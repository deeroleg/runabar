import React, { Component } from 'react'
import cookie from 'react-cookies'

import {UserContext} from '../context/User'
import { getRequest } from '../api/API'
import TopMenu from './TopMenu'

const Config = require('Config');

export default class Header extends Component {
	render() {
		const { isLogged, user } = this.context;
		
		if ( isLogged() ) {
			return (
				<header className="header">
					<div className="layout">
						<TopMenu modalByClickHandler={ this.props.modalByClickHandler } changeUserHandler={ this.props.changeUserHandler } />
						<div className="dashboard dropdown">
							<button className="btn dashboard-toggle dropdown-toggle" id="dashboard-dropdown" type="button" data-toggle="dropdown" data-display="static" aria-haspopup="true" aria-expanded="false"><img className="dashboard-toggle__icon" src="/i/general/icons/icon-user.svg" width="25" height="36" alt=""/><span className="dashboard-toggle__name">{user.nickname}</span></button>
							<div className="dashboard-select dropdown-menu dropdown-menu-right dropdown-menu-md-left" aria-labelledby="dashboard-dropdown">
								<a className="dropdown-item" href="#" onClick={this.props.modalByClickHandler} data-modal-action="profile" data-page-id={user.id}>Profile</a>
								<a className="dropdown-item" href="#" onClick={ this.props.modalByClickHandler } data-modal-action="settings">Settings</a>
								{ 
									!user.fromSocialNetwork ?
								<a className="dropdown-item" href="#" onClick={ this.props.modalByClickHandler } data-modal-action="password">Password</a>
									:
									''
								}
								<a className="dropdown-item" href="#" onClick={ this.props.logoutHandler }>Log out</a>
							</div>
						</div>
					</div>
				</header>
			);
		} else {
			return (
				<header className="header">
					<div className="layout">
						<div className="dashboard"><a className="dashboard__link" href="#" onClick={ this.props.modalByClickHandler } data-modal-action="authorization">Log in</a></div>
					</div>
				</header>
			);
		}
	}
}


Header.contextType = UserContext;
