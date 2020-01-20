import React, { Component } from 'react'
import cookie from 'react-cookies'
import { Parser } from 'html-to-react'
import Swiper from 'react-id-swiper';

import { getRequest } from '../../api/API'
import { DataContext } from '../../context/Data'
import { datetime } from '../../core/Utils'

const Config = require('Config');
const htmlParser = new Parser();

window.$ = window.jQuery = require('jquery');
const fancybox = require('@fancyapps/fancybox');
$.fancybox.defaults.hash = false;
$.fancybox.defaults.animationEffect = "zoom";
$.fancybox.defaults.infobar = false;
$.fancybox.defaults.buttons = ["close"];

export default class Topic extends Component {
	constructor(props) {
		super(props);
		this.state = { 
			swiper: null,
			errors: [],
			error: undefined,
			isLoaded: false,
			document: undefined,
			comments: [],
			comment: '',
			postInProcess: false,
			loadInProcess: false,
			hasMoreComments: false,
		};
	
		this.close = this.close.bind(this);
		this.commentsForm = this.commentsForm.bind(this);
		this.commentsList = this.commentsList.bind(this);
		this.loadMoreComments = this.loadMoreComments.bind(this);
		this.loadComments = this.loadComments.bind(this);
		this.handleChange = this.handleChange.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
		this.trackScrolling = this.trackScrolling.bind(this);
		this.handleKeyPress = this.handleKeyPress.bind(this);
		this.updateSwiper = this.updateSwiper.bind(this);
	}

	componentWillMount() {
		const { link, obj } = getRequest(this.props.data.action, this.props.data.pageId);
		
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
						this.setState({ isLoaded: true, error: result.errors[0].descriptions[0].message });
					}
					else {
						this.setState({ isLoaded: true, document: result });
						this.loadComments();
						const context = this.context;
						context.updateLikes('topic', result);
					}
				},
				(error) => {
					this.setState({ isLoaded: true, error: error });
				}
			);
	}

	handleKeyPress(event) {
		if(	event.key === 'Enter' && event.ctrlKey && this.state.comment ){
			this.handleSubmit(event);
		}
	}	

	trackScrolling(e) {
		const bottom = e.target.scrollHeight - e.target.scrollTop === e.target.clientHeight;
		if ( bottom && this.state.hasMoreComments ) {
			this.loadMoreComments();
		}
	};	

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

			let { link, obj } = getRequest('topic_comments', this.props.data.pageId);
			
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

	handleChange(event) {
		this.setState({ comment: event.target.value });
	}
	
	handleSubmit(event) {
		event.preventDefault();
		if ( !this.state.postInProcess ) {
			this.setState( { postInProcess: true } );
			
			let { link, obj } = getRequest( 'topic_comments_create', this.props.data.pageId );
			
			const data = new FormData();

			data.append('body', this.state.comment);

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
							this.setState({ comments: [result.element, ...this.state.comments], comment: '' });
						}
						
					},
					(error) => {
						this.setState({ error: error });
					}
				);
		}
	}

	close(e) {
		this.props.closeHandler(this.props.data.id);
		this.props.data.closeHandler(this.props.data.parentId, this.props.data.pageId);
	}

	updateSwiper(sw) {
		this.setState({ swiper: sw });
	}
	
	render() {
		const { document } = this.state;

		$('[data-fancybox="gallery-' + this.props.data.id + '"]').fancybox({
			beforeShow: function beforeShow() {
				if ( _state.swiper ) {
					_state.swiper.slideTo(this.index);
				}
			}
		});

		const _state = this.state;
		const swiperParams = {
			pagination: {
				el: '.swiper-pagination',
				clickable: true
			}
		};
		
		let objClass = "obj ent ent--modal";
		if ( document ) {
			objClass = document.isVoting ? 'obj ent ent--modal ent--vote' : 'obj ent ent--modal ent--proposal';
		}
		return (
			<div className={objClass} id={ 'entry-' + this.props.data.id } data-key={ this.props.data.id }>
				<header className="obj-header ent-header">
					<div className="ent-title">{document ? document.name : ''}</div>
					<div className="obj-control ent-control">
						<button className="btn btn-expand btn-expand--hide" type="button" title="Minimize" onClick={this.close}></button>
					</div>
				</header>
				<div className="obj-body ent-body">
					{ document ?
					<div className="ent-content">
						<div className="chat-header" style={{ padding: '20px 20px 0 20px'}}>
							<div className="entry-head">
								{ document.photos.length ? 
								<div className="entry-pic">
									<div className="avatar-container">
									{ 
										document.photos.length > 1 ?
										<div className="swiper-container">
											<Swiper getSwiper={this.updateSwiper} {...swiperParams}>
											{
												document.photos.map((photo, key) => (
												<div key={key} className="swiper-slide">
													<a href={photo.images['ligthbox']} data-fancybox={'gallery-' + this.props.data.id}>
														<img className="avatar-pic" src={photo.images['100x100']} alt="" width="100" height="100"/>
													</a>
												</div>
												))
											}
											</Swiper>
										</div>
										:
										<a href={document.photos[0].images['ligthbox']} data-fancybox={'gallery-' + this.props.data.id}>
											<img className="avatar-pic" src={document.photos[0].images['100x100']} alt="" width="100" height="100" alt=""/>
										</a>
									}
									</div>
								</div>
								:
								''
								}
								<div className="entry-thoughts">
								{ document.brief ?
									<div className="entry-thoughts-body">
										<div className="container">{document.brief}</div>
									</div>
									:
									''
								}
								</div>
							</div>
						</div>
						{ this.commentsList() }
					</div>
						:
					<div className="ent-content">
						<div className="container">Loading...</div>
					</div>
					}
				</div>
			</div>
		)
	}

	
	commentsForm() {
		if ( this.state.document && this.state.document.permissions.canAddComment ) {
			return (
			<div className="form-layout form-layout--sm form-layout--chat-form">
				<div className="form-layout__main">
					<textarea className="form-control" name="body" rows="4" value={this.state.comment} onChange={this.handleChange} onKeyPress={this.handleKeyPress}></textarea>
					{ this.showErrors('body') }
					{ this.showErrors('system') }
				</div>
				<div className="form-layout__side">
					<button className="btn btn-default btn-send" type="button" onClick={this.handleSubmit}>Send</button>
				</div>
			</div>
			);
		}
	}
	
	commentsList() {
		const { user } = this.context;
		return (
		<div className="chat-body">
			{ 
				this.state.comments.length ?
			<div className="chat-container">
				<div className="scroll-container" onScroll={this.trackScrolling}>
					<div className="container">
					{
						this.state.comments.map((comment, key) => {
							const className = comment.author && comment.author.id == user.id ? 'msg msg--you' : 'msg';
							return (
						<div key={key} className={className}>
							<div className="msg__body">
							{
								comment.author && comment.author.avatar && comment.author.avatar['32x32'] ?
								<div className="msg__pic"><img src={comment.author.avatar['32x32']} alt="" width="32" height="32"/></div>
								:
								''
							}
								<div className="msg__content">
									
							{
								comment.author ?
									<div className="msg__user">&lt;<a href="#" onClick={this.props.modalByClickHandler} data-modal-action="profile" data-page-id={comment.author.id}>{comment.author.nickname}</a>&gt;</div>
								:
									<div className="msg__user">deleted</div>
							}
									
									<div className="msg__text">{comment.body}</div>
								</div>
							</div>
							<div className="msg__meta">
								<div className="msg__date">{datetime(comment.createdAt)}</div>
							</div>
						</div>
							)
						})
					}
					</div>
				</div>
			</div>
				:
				<div className="container">No comments</div>
			}
			{ this.commentsForm() }
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

Topic.contextType = DataContext;
