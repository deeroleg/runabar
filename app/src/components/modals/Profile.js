import React, { Component } from 'react'
import cookie from 'react-cookies'

import { getRequest } from '../../api/API'
import { ActivityTypes } from '../../core/Const'
import { datetime } from '../../core/Utils'
import {UserContext} from '../../context/User'
import DelegationsList from './delegations/DelegationsList'
import DelegatedList from './delegations/DelegatedList'

const Config = require('Config');

export default class Profile extends Component {
	constructor(props) {
		super(props);
		this.state = { 
			fieldTab: 'profile',
			project_id: undefined,
			error: null,
			isLoaded: false,
			document: {},
			activity: [],
			projectsList: [],
			delegations: {},
			loadInProcess: false,
			hasMoreActivity: false,
			activityType: undefined,
			video: undefined,
		};
	
		this.handleTab = this.handleTab.bind(this);
		this.loadActivity = this.loadActivity.bind(this);
		this.listActivity = this.listActivity.bind(this);
		this.activityDelegatedUsers = this.activityDelegatedUsers.bind(this);
		this.trackScrolling = this.trackScrolling.bind(this);
		this.handleRadioChange = this.handleRadioChange.bind(this);
		this.loadVideo = this.loadVideo.bind(this);
	}

	componentDidMount() {
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
						this.loadVideo();
					}
				},
				(error) => {
					this.setState({ isLoaded: true, error: error });
				}
			);
	}

	handleTab(event) {
		const type = event.currentTarget.getAttribute('data-type');
		
		if ( type != this.state.fieldTab ) {
			const newState = { fieldTab: type };
			newState['loadInProcess'] = false;
			if ( type == 'profile' ) {
				newState['activity'] = [];
				newState['delegations'] = {};
				newState['hasMoreActivity'] = false;
				newState['activityType'] = undefined;
				this.setState(newState);
			}
			else if ( type == 'activity' ) {
				this.setState(newState);
				this.loadActivity();
			}
			else {
				newState['activity'] = [];
				newState['hasMoreActivity'] = false;
				newState['activityType'] = undefined;
				this.setState(newState);
			}
			
		}
	}

	trackScrolling(e) {
		const bottom = e.target.scrollHeight - e.target.scrollTop === e.target.clientHeight;
		if ( bottom && this.state.hasMoreActivity ) {
			this.loadMoreActivity();
		}
	};	
	
	loadMoreActivity(e) {
		if (e) {
			e.preventDefault();
		}
		if ( this.state.hasMoreActivity && this.state.activity.length ) {
			this.loadActivity(this.state.activity[this.state.activity.length-1].id);
		}
		else {
			this.setState({ hasMoreActivity: false })
		}
	}

	loadActivity(lastElementId) {
		if ( !this.state.loadInProcess ) {
			this.setState( { loadInProcess: true, hasMoreActivity: false } );

			let { link, obj } = getRequest('user_activity', this.props.data.pageId);
			
			const data = ['limit=4'];
//			const data = [];

			if ( lastElementId ) {
				data.push('element_id=' + lastElementId )
			}
			
			if ( this.state.activityType ) {
				data.push('type=' + this.state.activityType )
			}

			link += '?' + data.join('&');
			
			fetch(link, obj)
				.then((res) => {
					if ( res.status == 401 ) {
						cookie.remove(Config.authCookieName, { path: '/' });
						this.props.changeUserHandler({});
					}
					this.setState( { loadInProcess: false, hasMoreActivity: false } );
					return res.json();
				})
				.then(
					(result) => {
						const newState = { loadInProcess: false, hasMoreActivity: result.hasMore };
						if ( result.elements ) {
							newState['activity'] = [...this.state.activity, ...result.elements]
						}
						this.setState(newState);
					}
				);
		}
	}

	loadVideo() {
		let { link, obj } = getRequest('user_video', this.props.data.pageId);
		
		fetch(link, obj)
			.then((res) => {
				if ( res.status == 401 ) {
					cookie.remove(Config.authCookieName, { path: '/' });
					this.props.changeUserHandler({});
				}
				this.setState( { loadInProcess: false } );
				return res.json();
			})
			.then(
				(result) => {
					if ( result.videoURL ) {
						this.setState( { video: result } );
					}
				}
			);
	}
	
	handleRadioChange(event) {
		if ( event.target.value != this.state.activityType ) {
			this.setState({ activityType: event.target.value, activity: [] });
			
			const _this = this;
			setTimeout(function() { _this.loadActivity() }, 0);
		}
	}
	  
	render() {
		const doc = this.state.document;
		const { user } = this.context;
		
		return (
			<div className="obj wnd wnd--anyone" id={ 'window-' + this.props.data.id } data-key={ this.props.data.id }>
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
					<div className="wnd-title">{doc.nickname}</div>
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
									<div className="user-info">
										<div className="user-info__side">
										{
											doc.avatar ? 
											<div className="user-info__pic">
												<div className="avatar-wrapper">
													<img className="avatar-pic" src={doc.avatar['100x100']} alt="" width="100" height="100"/>
												</div>
											</div>
											:
											''
										}
										{ doc.facebook_profile_url || doc.twitter_profile_url ?
											<div className="user-info__links">
											{
												doc.facebook_profile_url ?
												<a className="btn btn-social" href={doc.facebook_profile_url} target="_blank"><span className="btn__label btn__label--fb">f</span></a>
												:
												''
											}
											{
												doc.twitter_profile_url ?
												<a className="btn btn-social" href={doc.twitter_profile_url} target="_blank"><span className="btn__label btn__label--tw">Tw</span></a>
												:
												''
											}
											</div>
											:
											''
										}
										</div>
										<div className="user-info__main">
											<div className="user-info__entry">{doc.username}</div>
											{
												doc.age ?
												<div className="user-info__entry">{doc.age} years old</div>
												:
												''
											}
											{
												doc.geo ?
											<div className="user-info__entry">{doc.geo}</div>
												:
												''
											}
											<div className="user-info__entry">{doc.roleName}</div>
										</div>
									</div>
									<div className="archive-outer">
										<div className="archive-container">
										{ this.state.fieldTab == 'activity' ?
											<div className="panel panel--in">
												<ul className="filter-list">
													<li className="filter-item">
														<div className="radio-group radio-group--sm">
															<label>
																<input type="radio" name="type" checked={this.state.activityType == undefined} value="" onChange={this.handleRadioChange}/>All
															</label>
														</div>
													</li>
													{
														Object.keys(ActivityTypes).map((type, i) => (
													<li className="filter-item" key={i}>
														<div className="radio-group radio-group--sm">
															<label>
																<input type="radio" name="type" value={type} checked={this.state.activityType == type} onChange={this.handleRadioChange}/>{ActivityTypes[type].label}
															</label>
														</div>
													</li>
														))
													}
												</ul>
											</div>
											:
											''
										}
											<div className={this.props.data.pageId == user.id ? 'archive archive--items-4' : 'archive archive--items-2'}>
												<ul className="archive-tabs">
													<li className="archive-tabs__item">
														<span className="btn-tab-wrapper">
															<button className={ this.state.fieldTab == 'profile' ? 'btn btn-tab is-active' : 'btn btn-tab' } type="button" onClick={this.handleTab} data-type="profile" role="tab"><span className="icon-group"><span className="icon-image"><img className="icon icon-user" src="/i/general/icons/icon-user.svg" alt="Profile icon" role="presentation"/></span><span className="icon-label">Profile</span></span></button>
														</span>
													</li>
													<li className="archive-tabs__item">
														<span className="btn-tab-wrapper">
															<button className={ this.state.fieldTab == 'activity' ? 'btn btn-tab is-active' : 'btn btn-tab' } type="button" onClick={this.handleTab} data-type="activity" role="tab"><span className="icon-group"><span className="icon-image"><img className="icon icon-history" src="/i/general/icons/icon-history.svg" alt="History icon" role="presentation"/></span><span className="icon-label">History</span></span></button>
														</span>
													</li>
												{
													this.props.data.pageId == user.id ?
													<li className="archive-tabs__item">
														<span className="btn-tab-wrapper">
															<button className={ this.state.fieldTab == 'delegations' ? 'btn btn-tab is-active' : 'btn btn-tab' } type="button" onClick={this.handleTab} data-type="delegations" role="tab"><span className="icon-group"><span className="icon-image"><img className="icon icon-history" src="/i/general/icons/icon-vote.svg" alt="Delegations icon" role="presentation"/></span><span className="icon-label">Delegations</span></span></button>
														</span>
													</li>
													:
												''
												}
												{
													this.props.data.pageId == user.id ?
													<li className="archive-tabs__item">
														<span className="btn-tab-wrapper">
															<button className={ this.state.fieldTab == 'delegated' ? 'btn btn-tab is-active' : 'btn btn-tab' } type="button" onClick={this.handleTab} data-type="delegated" role="tab"><span className="icon-group"><span className="icon-image"><img className="icon icon-history" src="/i/general/icons/icon-votes.svg" alt="Delegations icon" role="delegated"/></span><span className="icon-label">Delegated</span></span></button>
														</span>
													</li>
													:
												''
												}
												</ul>
												<div className="archive-content">
													{ 
														this.state.fieldTab == 'profile' ?
													<div className="scroll-container">
														<div className="container">
															<p>{doc.about}</p>
														</div>
													</div>
														: this.state.fieldTab == 'delegations' ?
														<DelegationsList modalByClickHandler={this.props.modalByClickHandler} showDialogHandler={this.props.showDialogHandler}/>
														: this.state.fieldTab == 'delegated' ?
														<DelegatedList modalByClickHandler={this.props.modalByClickHandler}/>
														:
														this.listActivity()
													}
												</div>
											</div>
										</div>
									</div>
									<div className="video-manage">
										<div className="video-manage__inner">
											<div className="video-manage__btn">
												<button className="btn btn-default" type="button" onClick={ this.props.modalByClickHandler } data-modal-action="delegation_form" data-page-id={this.props.data.pageId}>Delegate vote</button>
											</div>
										</div>
									</div>
									{
										this.state.video ?
									<div className="video-manage">
										<div className="video-manage__inner">
											<div className="video-manage__text"> You can check my video.</div>
											<div className="video-manage__btn">
												<button className="btn btn-default" type="button" onClick={ this.props.modalByClickHandler } data-modal-action="user_video" data-page-id={this.props.data.pageId}>View</button>
											</div>
										</div>
										<div className="video-manage__icon"><img src="/i/general/film.svg" width="47" height="55" alt=""/></div>
									</div>
										:
										''
									}
								</div>
							</div>
						</main>
					</div>
				</div>
			</div>
		);
	}
	
	listActivity() {
		if ( !this.state.activity.length ) {
			return (
			<div className="scroll-container">
				<div className="container">
					<p>No activity</p>
				</div>
			</div>
			)
		}
		
		return (
		<div className="scroll-container" onScroll={this.trackScrolling}>
			<div className="container">
				{
					this.state.activity.map((item, key) => (
				<div key={key} className="chat-msg">
					<div className="chat-msg__date">{datetime(item.createdAt)}, {ActivityTypes[item.type] ? ActivityTypes[item.type].listLabel : ''}
					{
						item.delegate ?
							<span> by <a href="#" onClick={this.props.modalByClickHandler} data-modal-action="profile" data-page-id={item.delegate.id}>{item.delegate.nickname}</a></span>
						:
						this.activityDelegatedUsers(item.delegated)
					}
					</div>
					<div className="chat-msg__body">{item.offer ? item.offer.name : ''}</div>
				</div>
					))
				}
				{ this.state.loadInProcess ? <div>Loadding...</div>	: '' }
			</div>
		</div>
		)
	}

	intersperse(arr, sep) {
		if (arr.length === 0) {
			return [];
		}

		return arr.slice(1).reduce(function(xs, x, i) {
			return xs.concat([sep, x]);
		}, [arr[0]]);
	}
	
	activityDelegatedUsers(list) {
		const _this = this;
		if ( list && list.length ) {
			const res = list.map(function(d, i) {
				return <a href="#" onClick={_this.props.modalByClickHandler} data-modal-action="profile" data-page-id={d.id}>{d.nickname}</a>;
			});
			
			return (
				<span> as {this.intersperse(res, ", ")}</span>
			);
		}
		
		return '';
	}
}

Profile.contextType = UserContext;
