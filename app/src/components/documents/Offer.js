import React, { Component, useState } from 'react'
import cookie from 'react-cookies'
import { Parser } from 'html-to-react'
import Swiper from 'react-id-swiper';

import { getRequest } from '../../api/API'
import { DataContext } from '../../context/Data'
import LikeButton from '../LikeButton'
import VoteButtons from '../VoteButtons'
import Comment from '../Comment'

const Config = require('Config');
const htmlParser = new Parser();

window.$ = window.jQuery = require('jquery');
const fancybox = require('@fancyapps/fancybox');
$.fancybox.defaults.hash = false;
$.fancybox.defaults.animationEffect = "zoom";
$.fancybox.defaults.infobar = false;
$.fancybox.defaults.buttons = ["close"];

export default class Offer extends Component {
	constructor(props) {
		super(props);
		this.state = { 
			swiper: null,
			fieldTab: 'advantages',
			error: null,
			isLoaded: false,
			document: undefined,
			comments: [],
		};
	
		this.handleTab = this.handleTab.bind(this);
		this.close = this.close.bind(this);
		this.commentsList = this.commentsList.bind(this);
		this.loadComments = this.loadComments.bind(this);
		this.updateSwiper = this.updateSwiper.bind(this);
		this.delegateMessage = this.delegateMessage.bind(this);
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
						context.updateLikes('offer', result);
						context.updateVotes(result);
					}
				},
				(error) => {
					this.setState({ isLoaded: true, error: error });
				}
			);
	}
	
	loadComments() {
		let { link, obj } = getRequest('offer_comments', this.props.data.pageId);
		
		const data = ['limit=3'];

		link += '?' + data.join('&');
		
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
					if ( result.elements ) {
						this.setState({ comments: result.elements });
					}
				}
			);
	}

	handleTab(event) {
		const type = event.currentTarget.getAttribute('data-type');
		
		this.setState({ fieldTab: type });
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
		
		let objClass = "obj ent ent--modal";
		if ( document ) {
			objClass = document.isVoting ? 'obj ent ent--modal ent--vote' : 'obj ent ent--modal ent--proposal';
		}
		
		const _state = this.state;
		$('[data-fancybox="gallery-' + this.props.data.id + '"]').fancybox({
			beforeShow: function beforeShow() {
				if ( _state.swiper ) {
					_state.swiper.slideTo(this.index);
				}
			}
		});

		const swiperParams = {
			pagination: {
				el: '.swiper-pagination',
				clickable: true
			}
		};
		
		return (
			<div className={objClass} id={ 'entry-' + this.props.data.id } data-key={ this.props.data.id }>
				<header className="obj-header ent-header">
					<div className="ent-title">{document ? document.name : ''}</div>
					<div className="obj-control ent-control">
						<button className="btn btn-expand btn-expand--hide" type="button" title="Minimize" onClick={this.close}></button>
					</div>
				</header>
				<div className="obj-body ent-body">
					<div className="ent-content">
						{ document ?
						<div className="container">
							<div className="entry-head">
								<div className="entry-info">
									<div className="entry-info__head">
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
										<div className="entry-data">
										{ document.timeCosts ?
											<div className="form-group">
												<div className="entry-data__item"><img className="icon icon-time" src="/i/general/icons/icon-time.svg" alt="Time icon" role="presentation"/>{document.timeCosts}</div>
											</div>
											:
											''
										}
										{ document.implementationCosts ?
											<div className="form-group">
												<div className="entry-data__item"><img className="icon icon-money" src="/i/general/icons/icon-money.svg" alt="Money icon" role="presentation"/>{document.implementationCosts}</div>
											</div>
											:
											''
										}
										{ document.brief ?
											<div className="form-group">
												<div className="entry-tags">{document.brief}</div>
											</div>
											:
											''
										}
										</div>
									</div>
									<div className="entry-info__body">
										<div className="entry-dates">{this.offerDates(document)}</div>
										<div className="entry-path">> {document.category.name} >> {document.subcategory.name}</div>
										{ this.delegateMessage() }
									</div>
								</div>
								<div className="entry-thoughts">
									<ul className="nav-tabs nav-tabs--sm" role="tablist">
										{ document.advantages ?
										<li className="nav-item"><span className="btn-tab-wrapper">
											<button className={this.state.fieldTab == 'advantages' ? 'btn btn-tab is-active' : 'btn btn-tab'} type="button" role="tab"onClick={this.handleTab} data-type="advantages">Plus</button></span>
										</li>
										:
										''
										}
										{ document.disadvantages ?
										<li className="nav-item"><span className="btn-tab-wrapper">
											<button className={this.state.fieldTab == 'disadvantages' ? 'btn btn-tab is-active' : 'btn btn-tab'} type="button" role="tab"onClick={this.handleTab} data-type="disadvantages">Minus</button></span>
										</li>
										:
										''
										}
										{ document.expertOpinion ?
										<li className="nav-item"><span className="btn-tab-wrapper">
											<button className={this.state.fieldTab == 'expert_opinion' ? 'btn btn-tab is-active' : 'btn btn-tab'} type="button" role="tab"onClick={this.handleTab} data-type="expert_opinion">Expert</button></span>
										</li>
										:
										''
										}
									</ul>
									<div className="entry-thoughts-body">
										<div className="scroll-container">
											<div className="container">
										{ this.state.fieldTab == 'advantages' ?
												<p>{document.advantages}</p>
											:
										  this.state.fieldTab == 'disadvantages' ?
												<p>{document.disadvantages}</p>
											:
										  this.state.fieldTab == 'expert_opinion' ?
												<p>{document.expertOpinion}</p>
											:
											''
										}
											</div>
										</div>
									</div>
								</div>
							</div>
							<div className="form-layout form-layout--reverse form-layout--about">
								<div className="form-layout__main">
									<div className="entry-about">
										<div className="scroll-container">
											<div className="container">
												{htmlParser.parse(document.body)}
											</div>
										</div>
									</div>
								</div>
								<div className="form-layout__side">
								{ document.isVoting ?
									<VoteButtons document={document} changeUserHandler={this.props.changeUserHandler} showMessageHandler={ this.props.showMessageHandler }/>
									:
									<div className="entry-buttons">
										<LikeButton document={document} type="offer" changeUserHandler={this.props.changeUserHandler} showMessageHandler={ this.props.showMessageHandler }/>
									</div>
								}
								</div>
							</div>
							{ this.commentsList() }
						</div>
							:
						<div>Loading...</div>
						}
					</div>
				</div>
			</div>
		)
	}
	
	delegateMessage() {
		const { document } = this.state;
		
		if ( document && document.isVoting && document.delegated ) {
			const delegate = document.delegate;
			if ( delegate.offerId ) {
				return <div>You delegated this voting to <a href="#" onClick={this.props.modalByClickHandler} data-modal-action="profile" data-page-id={delegate.delegate.id}>{delegate.delegate.nickname}</a></div>
			}
			else if ( delegate.categoryId ) {
				return <div>You delegated this category to <a href="#" onClick={this.props.modalByClickHandler} data-modal-action="profile" data-page-id={delegate.delegate.id}>{delegate.delegate.nickname}</a></div>
			}
			else {
				return <div>You delegeted all your votes to <a href="#" onClick={this.props.modalByClickHandler} data-modal-action="profile" data-page-id={delegate.delegate.id}>{delegate.delegate.nickname}</a></div>
			}
		}
		
		return '';
	}
	
	commentsList() {
		return (
		<div className="form-layout form-layout--go-comments">
			{ this.state.comments.length ?
			<div className="form-layout__main">
				<div className="entry-comments">
					<div className="scroll-container">
						<div className="container">
					{
						this.state.comments.map((item, key) => (
							<Comment key={key} comment={item} modalByClickHandler={this.props.modalByClickHandler}/>
						))
					}
						</div>
					</div>
				</div>
			</div>
			:
			''
			}
			<div className="form-layout__side">
				{ this.state.document.isVoting && this.state.document.votingAllowed ?
					<div>
						<button className="btn btn-default" type="button" onClick={this.props.modalByClickHandler} data-modal-action="single_delegation_form" data-page-id={this.props.data.pageId}>Delegate this</button>
						<br/>
					</div>
				:
					''
				}
				<button className="btn btn-default" type="button" onClick={this.props.modalByClickHandler} data-modal-action="offer_comments" data-page-id={this.props.data.pageId}>Go to comments</button>
			</div>
		</div>
		)
	}

	offerDates(offer) {
		let dtime = '';
		const match = /^\d{2}(\d{2})-(\d{2})-(\d{2})/.exec(offer.dtime)
		if ( match ) {
			dtime = sprintf('%02d\\%02d\\%02d', match[3], match[2], match[1]);
		}
		
		let etime = '';
		if ( offer.isVoting ) {
			const eTimeMatch = /^\d{2}(\d{2})-(\d{2})-(\d{2})/.exec(offer.etime)
			if ( eTimeMatch ) {
				etime = sprintf('%02d\\%02d\\%02d', eTimeMatch[3], eTimeMatch[2], eTimeMatch[1]);
			}
		}

		return <div className="entry-dates">{dtime ? dtime : ''}{etime ? ' — ' + etime : ''}</div>;
	}
	
}

Offer.contextType = DataContext;
