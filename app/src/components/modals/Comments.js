import React, { Component } from 'react'
import cookie from 'react-cookies'

import { getRequest } from '../../api/API'
import { datetime } from '../../core/Utils'

import Comment from '../Comment'

const Config = require('Config');

export default class Comments extends Component {
	constructor(props) {
		super(props);
		this.state = {
			body: '',
			document: undefined,
			errors: [],
			error: undefined,
			comments: [],
			postInProcess: false,
			loadInProcess: false,
			hasMoreComments: false,
		};

		this.loadComments = this.loadComments.bind(this);
		this.loadMoreComments = this.loadMoreComments.bind(this);
		this.handleChange = this.handleChange.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
		this.commentsForm = this.commentsForm.bind(this);
		this.commentsList = this.commentsList.bind(this);
		this.trackScrolling = this.trackScrolling.bind(this);
		this.handleKeyPress = this.handleKeyPress.bind(this);
	}

	componentDidMount() {
		const { link, obj } = getRequest('offer', this.props.data.pageId);

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
						this.setState({ error: result.errors[0].descriptions[0].message });
					}
					else {
						this.setState({ document: result });
						this.loadComments();
					}
				},
			);
	}

	handleKeyPress(event) {
		if(	event.key === 'Enter' && event.ctrlKey && this.state.body ){
			this.handleSubmit(event);
		}
	}	

	trackScrolling(e) {
		const bottom = e.target.scrollHeight - e.target.scrollTop === e.target.clientHeight;
		if ( bottom && this.state.hasMoreComments ) {
			this.loadMoreComments();
		}
	};	

	handleChange(event) {
		this.setState({ 'body': event.target.value });
	}
	
	handleSubmit(event) {
		event.preventDefault();
		if ( !this.state.postInProcess ) {
			this.setState( { postInProcess: true } );
			
			let { link, obj } = getRequest( 'offer_comments_create', this.props.data.pageId );
			
			const data = new FormData();

			data.append('body', this.state.body);

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
						this.setState( { postInProcess: false } );
						if ( result.result == 'error' ) {
							this.setState({ errors: result.errors })
						}
						else {
							this.setState({ comments: [result.element, ...this.state.comments], body: '' });
						}
						
					},
					(error) => {
						this.setState({ error: error });
					}
				);
		}
	}

	loadMoreComments(e) {
		if (e) {
			e.preventDefault();
		}
		if ( this.state.hasMoreComments && this.state.comments.length ) {
			this.loadComments(this.state.comments[this.state.comments.length-1].id);
		}
		else {
			this.setState({ hasMoreComments: false })
		}
	}

	loadComments(lastElementId) {
		if ( !this.state.loadInProcess ) {
			this.setState( { loadInProcess: true, hasMoreComments: false } );

			let { link, obj } = getRequest('offer_comments', this.props.data.pageId);
			
			const data = [];

			if ( lastElementId ) {
				data.push('element_id=' + lastElementId )
			}

			link += '?' + data.join('&');
			
			fetch(link, obj)
				.then((res) => {
					if ( res.status == 401 ) {
						cookie.remove(Config.authCookieName, { path: '/' });
						this.props.changeUserHandler({});
					}
					this.setState( { loadInProcess: false, hasMoreComments: false } );
					return res.json();
				})
				.then(
					(result) => {
						this.setState( { loadInProcess: false, hasMoreComments: result.hasMore } );
						if ( result.elements ) {
							this.setState({ comments: [...this.state.comments, ...result.elements] });
						}
					}
				);
		}
	}

	render() {
		return (
			<div className="obj ent ent--modal ent--chat ent--new" id={ 'window-' + this.props.data.id } data-key={ this.props.data.id }>
				<header className="obj-header ent-header">
					<div className="obj-control ent-control">
						<button className="btn btn-min btn-min--hide" type="button" title="Minimize"></button>
					</div>
					<div className="ent-title">{this.state.document ? this.state.document.name : ''}</div>
					<div className="obj-control ent-control">
						<button className="btn btn-close" type="button" title="Close"></button>
					</div>
				</header>
				<div className="obj-body ent-body">
					<div className="ent-content">
						<div className="container">
							{
								this.state.error ?
								<p>{this.state.error}</p>
								:
								''
							}
							<div className="vote-chat">
								{ this.commentsList() }
							</div>
							{ this.commentsForm() }
						</div>
					</div>
				</div>
			</div>
		);
	}
	
	commentsForm() {
		if ( this.state.document && this.state.document.permissions.canAddComment ) {
			return (
			<div className="form-layout form-layout--sm form-layout--send-comment">
				<div className="form-layout__main">
					<textarea className="form-control" name="body" rows="3" value={this.state.body} onChange={this.handleChange} onKeyPress={this.handleKeyPress}></textarea>
					{ this.showErrors('body') }
					{ this.showErrors('system') }
				</div>
				<div className="form-layout__side">
					<button className="btn btn-default" type="button" onClick={this.handleSubmit}>Send</button>
				</div>
			</div>
			);
		}
	}
	
	commentsList() {
		if ( !this.state.comments.length ) {
			return <div className="scroll-container">No comments</div>
		}
		
		return (
		<div className="scroll-container" onScroll={this.trackScrolling}>
		{
			this.state.comments.map((item, key) => (
				<Comment key={key} comment={item} showDate="true"  modalByClickHandler={this.props.modalByClickHandler}/>
			))
		}
		{ this.state.loadInProcess ? <div>Loadding...</div>	: '' }
		</div>
		)
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
