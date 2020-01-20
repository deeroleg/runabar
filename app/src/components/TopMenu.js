import React, { Component } from 'react'
import cookie from 'react-cookies'

import {UserContext} from '../context/User'
import { getRequest } from '../api/API'

const Config = require('Config');

export default class TopMenu extends Component {
	constructor(props) {
		super(props);
		this.state = { 
			projects: [] 
		};
	}

	componentDidMount() {
		const { isLogged } = this.context;
		
		if ( isLogged() ) {
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
						this.setState({ projects: result.elements || [] });
					}
				);
		}
	}

	render() {
		const { isLogged } = this.context;
		
		if ( isLogged() ) {
			if ( this.state.projects.length ) {
				return <div className="project dropdown">
							<button className="btn project-toggle dropdown-toggle" id="project-dropdown" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"><span className="project-toggle__name">Project</span></button>
							<nav className="project-select dropdown-menu" aria-labelledby="project-dropdown">
							{
								this.state.projects.map((element, key) => (
								<a href="#" key={key} className="dropdown-item"  onClick={ this.props.modalByClickHandler } data-modal-action="project" data-page-id={element.id}>{element.name}</a>
								))
							}
							</nav>
						</div>;
			}
			return <div className="project dropdown">Loading...</div>
		}
		else {
			return <div className="project dropdown">Loading...</div>
		}
	}
}


TopMenu.contextType = UserContext;
