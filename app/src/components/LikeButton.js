import React, { Component } from 'react'
import cookie from 'react-cookies'

import { getRequest } from '../api/API'
import { DataContext } from '../context/Data'

const Config = require('Config');

export default class LikeButton extends Component {
	constructor(props) {
		super(props);
		this.state = { 
			type: this.props.type,
			document: this.props.document,
		};
		
		this.likeAction = this.likeAction.bind(this);
	}
	
	likeAction() {
		let { link, obj } = getRequest( this.state.type + '_like', this.state.document.id );

		const { likes } = this.context;
		
		let liked = likes[this.state.type] && likes[this.state.type][this.state.document.id] ? likes[this.state.type][this.state.document.id]['liked'] : false;
		obj.method = liked ? 'DELETE' : 'POST';
		
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
						
						doc.liked = result.liked;
						doc.likesCount = result.likesCount;
					
						context.updateLikes(this.state.type, doc);
					}
					else {
						this.props.showMessageHandler({ title: 'Error', message: result.errors[0].descriptions[0].message });
					}
				}
			);
	}
	
	render() {
		const { likes } = this.context;

		if ( this.state.document.likesAllowed ) {
			return (
				<span className="entry-button-group">
					<button className="btn btn-default" onClick={this.likeAction} type="button">Interesting</button><span className="entry-button-counter">{ likes[this.state.type][this.state.document.id]['likesCount'] || 0 }</span>
				</span>
			);
		}
		
		return '';
	}
}

LikeButton.contextType = DataContext;
