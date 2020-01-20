import React, { Component } from 'react'
import cookie from 'react-cookies'

import { getRequest } from '../api/API'
import { DataContext } from '../context/Data'

const Config = require('Config');

export default class VoteButtons extends Component {
	constructor(props) {
		super(props);
		this.state = { 
			document: this.props.document,
		};
		
		this.voteAction = this.voteAction.bind(this);
	}
	
	voteAction(event) {
		let { link, obj } = getRequest( 'voting_vote', this.state.document.id );

		link += '?type=' + event.currentTarget.getAttribute('data-type');
		
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
					if ( result.result == 'success' ) {
						const context = this.context;
						const doc = this.state.document;

						doc.voted = result.voted;
						doc.votesCount = result.votesCount;
						
						context.updateVotes(doc);
					}
					else {
						this.props.showMessageHandler({ title: 'Error', message: result.errors[0].descriptions[0].message });
					}
				}
			);
	}
	
	render() {
		const { votes } = this.context;
		
		const data = votes[this.state.document.id]['votesCount'];
		const voted = votes[this.state.document.id]['voted'];
		const delegated = votes[this.state.document.id]['delegated'];
		return (
			<div className="entry-buttons">
				<span className="entry-button-group">
					<button className="btn btn-default" type="button" onClick={this.voteAction} disabled={ !this.state.document.votingAllowed || delegated || voted == 'yes' } data-type="yes">Agree</button>
					<span className="entry-button-counter">{data.yes}%</span>
				</span>
				<span className="entry-button-group">
					<button className="btn btn-default" type="button" onClick={this.voteAction} disabled={ !this.state.document.votingAllowed || delegated || voted == 'no' } data-type="no">Disagree</button>
					<span className="entry-button-counter">{data.no}%</span>
				</span>
				<span className="entry-button-group">
					<button className="btn btn-default" type="button" onClick={this.voteAction} disabled={ !this.state.document.votingAllowed || delegated || voted == 'ban' } data-type="ban">Ban</button>
					<span className="entry-button-counter">{data.ban}%</span>
				</span>
			</div>
		);
	}
}

VoteButtons.contextType = DataContext;
