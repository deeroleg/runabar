import React, { Component } from 'react'

import { datetime } from '../core/Utils'

const Config = require('Config');

export default class Comment extends Component {
	render() {
		const comment = this.props.comment;
		return (
		<div className="chat-msg">
			<div className="chat-msg__body">
				<span className="chat-msg__name">
			{
				this.props.comment.author ?
					<a href="#" onClick={this.props.modalByClickHandler} data-modal-action="profile" data-page-id={comment.author.id}>{comment.author.nickname}</a>
					: 'deleted'
			}:
				</span>
				<span className="chat-msg__text">{comment.body}</span>
			</div>
			{ this.props.showDate ?
			<div className="chat-msg__date">{datetime(comment.createdAt)}</div>
			:
			''
			}
		</div>
		)
	}
}
