import React, { Component } from 'react'
import { findDOMNode } from 'react-dom'
window.$ = window.jQuery = require('jquery');
const fancybox = require('@fancyapps/fancybox');
$.fancybox.defaults.hash = false;
$.fancybox.defaults.animationEffect = "zoom";
$.fancybox.defaults.infobar = false;
$.fancybox.defaults.buttons = ["close"];

import cookie from 'react-cookies'

import { getRequest } from '../../api/API'
import LikeButton from '../LikeButton'
import VoteButtons from '../VoteButtons'
import { DataContext } from '../../context/Data'
import { categoriesDropdown, datetime } from '../../core/Utils'
import { OffersStates, VotesStates } from '../../core/Const'

const Config = require('Config');

export default class Project extends Component {
	constructor(props) {
		super(props);
		this.state = { 
			error: null,
			isLoaded: false,
			postInProcess: false,
			hasMoreDocuments: false,
			document: undefined,
			delegate: undefined,
			lastElementId: undefined,
			categoriesTree: [],
			filterForm: {
				action: 'offers',
				state: undefined,
			},
			documents: [],
			canAddCategory: false,
			minimized: {},
		};
		
		this.offersList = this.offersList.bind(this);
		this.topicsList = this.topicsList.bind(this);
		this.loadCategories = this.loadCategories.bind(this);
		this.chooseCategory = this.chooseCategory.bind(this);
		this.loadDocuments = this.loadDocuments.bind(this);
		this.loadMoreDocuments = this.loadMoreDocuments.bind(this);
		this.reloadDocuments = this.reloadDocuments.bind(this);
		this.categoriesMenu = this.categoriesMenu.bind(this);
		this.addCategoryBtn = this.addCategoryBtn.bind(this);
		this.addOfferBtn = this.addOfferBtn.bind(this);
		this.addTopicBtn = this.addTopicBtn.bind(this);
		this.toggleFilterAction = this.toggleFilterAction.bind(this);
		this.toggleDocument = this.toggleDocument.bind(this);
		this.expandOffer = this.expandOffer.bind(this);
		this.expandTopic = this.expandTopic.bind(this);
		this.handleRadioChange = this.handleRadioChange.bind(this);
		this.delegateMessage = this.delegateMessage.bind(this);
	}

	componentDidMount() {
		this.loadCategories();
		this.loadDocuments();

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
					}
				},
				(error) => {
					this.setState({ isLoaded: true, error: error });
				}
			);
	}

	handleRadioChange(event) {
		let form = this.state.filterForm;

		if ( form.state != event.target.value ) {
			form.state = event.target.value;
			
			this.setState({ filterForm: form, documents: [], minimized: [], delegate: undefined });
			
			this.loadDocuments();
		}
	}
	
	chooseCategory(event) {
		event.preventDefault();
		
		let form = this.state.filterForm;
		
		if ( event.currentTarget.getAttribute('data-subcategory-id') ) {
			form['category_id'] = event.currentTarget.getAttribute('data-category-id');
			form['subcategory_id'] = event.currentTarget.getAttribute('data-subcategory-id');
		}
		else if ( event.currentTarget.getAttribute('data-category-id') ) {
			form['category_id'] = event.currentTarget.getAttribute('data-category-id');
			form['subcategory_id'] = undefined;
		}
		else {
			form['category_id'] = undefined;
			form['subcategory_id'] = undefined;
		}
		
		this.setState({ filterForm: form, documents: [], minimized: [], delegate: undefined })
		
		this.loadDocuments();
	}
	
	toggleFilterAction(event) {
		let form = this.state.filterForm;
		if ( form.action != event.currentTarget.getAttribute('data-action') ) {
			form.action = event.currentTarget.getAttribute('data-action');
			form.state = undefined;
			this.setState({ filterForm: form, documents: [], minimized: [], delegate: undefined })
			
			this.loadDocuments();
		}
	}
	
	loadMoreDocuments(e) {
		e.preventDefault();
		if ( this.state.hasMoreDocuments && this.state.documents.length ) {
			this.loadDocuments(this.state.documents[this.state.documents.length-1].id);
		}
		else {
			this.setState({ hasMoreDocuments: false })
		}
	}

	reloadDocuments() {
		this.setState({ documents: [], minimized: [] })
		this.loadDocuments();
	}
	
	loadDocuments(lastElementId) {
		if ( !this.state.postInProcess ) {
			this.setState( { postInProcess: true, hasMoreDocuments: false } );
			const form = this.state.filterForm;
			
			let { link, obj } = getRequest(form.action, this.props.data.pageId);
			
			const data = [];
			
			if ( form.subcategory_id ) {
				data.push('subcategory_id=' + form.subcategory_id);
			}
			else if ( form.category_id ) {
				data.push('category_id=' + form.category_id);
			}
			
			if ( form.state ) {
				data.push('state=' + form.state);
			}
			
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
					this.setState( { postInProcess: false, hasMoreDocuments: false } );
					return res.json();
				})
				.then(
					(result) => {
						this.setState( { postInProcess: false, hasMoreDocuments: result.hasMore } );
						const likeType = this.state.filterForm.action == 'topics' ? 'topic' : 'offer';
						if ( result.elements ) {
							const context = this.context;
							result.elements.map((el) => {
								context.updateLikes(likeType, el);
								context.updateVotes(el);
							});

							this.setState({ documents: [...this.state.documents, ...result.elements], delegate: result.delegate });
						}
					}
				);
		}
	}
	
	loadCategories() {
		const { link, obj } = getRequest('categories_tree', this.props.data.pageId);
		
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
					if ( result.categories ) {
						this.setState({ categoriesTree: result.categories, canAddCategory: result.canAdd });
						var $this = findDOMNode(this);
						categoriesDropdown($this);
					}
				}
			);
	}
	
	toggleDocument(event) {
		const ent = event.target.closest('.ent');
		const minimized = this.state.minimized;
		const docId = event.currentTarget.getAttribute('data-page-id');
		
		if ( docId in minimized ) {
			delete minimized[docId];
			this.props.closeModalByClickHandler(event);
		}
		else {
			minimized[docId] = 1;
			this.props.modalByClickHandler(event);
		}
		
		this.setState({ minimized: minimized });
	}

	expandOffer(id) {
		if ( this.state.filterForm.action == 'topics' ) {
			return false;
		}
		
		const minimized = this.state.minimized;
		
		if ( id in minimized ) {
			delete minimized[id];
			this.setState({ minimized: minimized });
		}
	}

	expandTopic(id) {
		if ( this.state.filterForm.action != 'topics' ) {
			return false;
		}
		
		const minimized = this.state.minimized;
		
		if ( id in minimized ) {
			delete minimized[id];
			this.setState({ minimized: minimized });
		}
	}
	
	render() {
		const { error, isLoaded, document } = this.state;

		let body = <div>Loading...</div>;
		if ( isLoaded ) {
			if ( document ) {
				if ( this.state.filterForm.action == 'topics' ) {
					body = this.topicsList();
				}
				else {
					body = this.offersList();
				}
			}
			else if ( error ) {
				body = <div className="text-danger">{error}</div>
			}
		}
		return (
			<div className="obj wnd wnd--project" id={ 'window-' + this.props.data.id } data-key={ this.props.data.id }>
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
					<div className="wnd-title">{ document ? document.name : 'Loading..' }</div>
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
					<nav className="wnd-nav">
						<ul className="nav-tabs" role="tablist">
							<li className="nav-item"><span className="btn-tab-wrapper">
								<button className={this.state.filterForm.action == 'votings' ? 'btn btn-tab is-active' : 'btn btn-tab'} onClick={this.toggleFilterAction} data-action="votings" type="button" role="tab"><span className="icon-group"><span className="icon-image"><img className="icon icon-votes" src="/i/general/icons/icon-votes.svg" alt="Votes icon" role="presentation"/></span><span className="icon-label">Votes</span></span>
							</button></span></li>
							<li className="nav-item"><span className="btn-tab-wrapper">
								<button className={this.state.filterForm.action == 'offers' ? 'btn btn-tab is-active' : 'btn btn-tab'} onClick={this.toggleFilterAction} data-action="offers" type="button" role="tab"><span className="icon-group"><span className="icon-image"><img className="icon icon-proposal" src="/i/general/icons/icon-proposal.svg" alt="Proposal icon" role="presentation"/></span><span className="icon-label">Proposal</span></span>
							</button></span></li>
							<li className="nav-item"><span className="btn-tab-wrapper">
								<button className={this.state.filterForm.action == 'topics' ? 'btn btn-tab is-active' : 'btn btn-tab'} onClick={this.toggleFilterAction} data-action="topics" type="button" role="tab"><span className="icon-group"><span className="icon-image"><img className="icon icon-votes" src="/i/general/icons/icon-vote.svg" alt="Topics icon" role="presentation"/></span><span className="icon-label">Forum</span></span>
							</button></span></li>
						</ul>
					</nav>
					{
						this.state.filterForm.action == 'votings' ?
					<div className="wnd-panel panel">
						<ul className="filter-list">
							<li className="filter-item">
								<div className="radio-group radio-group--sm">
									<label>
										<input type="radio" name="state" checked={this.state.filterForm.state == undefined} value="" onChange={this.handleRadioChange}/>All
									</label>
								</div>
							</li>
							{
								Object.keys(VotesStates).map((state, i) => (
							<li className="filter-item" key={i}>
								<div className="radio-group radio-group--sm">
									<label>
										<input type="radio" name="state" value={state} checked={this.state.filterForm.state == state} onChange={this.handleRadioChange}/>{VotesStates[state]}
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
					{
						this.state.filterForm.action == 'offers' ?
					<div className="wnd-panel panel">
						<ul className="filter-list">
							<li className="filter-item">
								<div className="radio-group radio-group--sm">
									<label>
										<input type="radio" name="state" checked={this.state.filterForm.state == undefined} value="" onChange={this.handleRadioChange}/>All
									</label>
								</div>
							</li>
							{
								Object.keys(OffersStates).map((state, i) => (
							<li className="filter-item" key={i}>
								<div className="radio-group radio-group--sm">
									<label>
										<input type="radio" name="state" value={state} checked={this.state.filterForm.state == state} onChange={this.handleRadioChange}/>{OffersStates[state]}
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
					<div className="wnd-content">
						<div className="wnd-side">
							{this.categoriesMenu()}
							{ this.delegateMessage() }
							<div className="add-actions">
								{ this.addTopicBtn() }
								{ this.addOfferBtn() }
							</div>
						</div>
						<main className="wnd-main">
							<div className="scroll-container">
								{body}
							</div>
						</main>
					</div>
				</div>
			</div>
		)
	}

	delegateMessage() {
		const { delegate } = this.state;
		
		if ( delegate ) {
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
	
	addOfferBtn() {
		if ( this.state.document && this.state.document.permissions.canAddOffer ) {
			return (
				<div className="add-actions__item">
					<button className="btn" onClick={this.props.modalByClickHandler} data-modal-action="new-offer" data-project-id={this.props.data.pageId} data-category-id={this.state.filterForm.category_id} data-subcategory-id={this.state.filterForm.subcategory_id} type="button"><span className="icon-group"><span className="icon-image"><img className="icon icon-proposal" src="/i/general/icons/icon-proposal.svg" alt="Add proposal" role="presentation"/></span><span className="icon-label">Add proposal</span></span></button>
				</div>
			)
		}
	}

	addTopicBtn() {
		if ( this.state.document && this.state.document.permissions.canAddTopic ) {
			return (
				<div className="add-actions__item">
					<button className="btn" onClick={this.props.modalByClickHandler} data-modal-action="new-topic" data-project-id={this.props.data.pageId} data-category-id={this.state.filterForm.category_id} data-subcategory-id={this.state.filterForm.subcategory_id} type="button"><span className="icon-group"><span className="icon-image"><img className="icon icon-proposal" src="/i/general/icons/icon-vote.svg" alt="Add forum topic" role="presentation"/></span><span className="icon-label">Add topic</span></span></button>
				</div>
			)
		}
	}
	
	categoriesMenu() {
		if ( this.state.categoriesTree && this.state.categoriesTree.length ) {
			return (
				<ul className="side-menu">
				{
					this.state.categoriesTree.map((category) => (
					<li key={category.id} className="side-menu__item dropright">
						<a className="side-menu__link" href="#" onClick={this.chooseCategory} data-category-id={category.id} >{category.name}</a>
						{this.subcategoriesMenu(category)}
					</li>
					))
				}
				{ this.state.canAddCategory ?
					<li className="side-menu__item">{this.addCategoryBtn( this.props.data.pageId )}</li>
					:
					''
				 }
				</ul>
			)
		}
		else {
			return <div>Loading...</div>
		}
	}
	
	subcategoriesMenu(category) {
		if ( category.subcategories.length || this.state.canAddCategory ) {
			return(
				<div className="side-submenu dropdown-menu">
				{
					category.subcategories.map((subCategory) => (
					<a key={subCategory.id} className="side-submenu__link dropdown-item" href="#" onClick={this.chooseCategory} data-category-id={category.id} data-subcategory-id={subCategory.id}>{subCategory.name}</a>
					))
				}
				{this.addCategoryBtn( this.props.data.pageId, category.id )}
				</div>
			);
		}
	}
	
	addCategoryBtn( projectId, categoryId ) {
		const className = categoryId ? 'side-submenu__link side-submenu__link--new dropdown-item' : 'side-menu__link side-menu__link--new';
		
		return this.state.canAddCategory ? <a className={className} href="#" onClick={this.props.modalByClickHandler} data-modal-action="new-category" data-project-id={projectId} data-category-id={categoryId}>Add new</a> : '';
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
	
	offersList() {
		if ( !this.state.documents.length ) {
			return <div className="container">List is empty</div>
		}
		
		return (
		<div className="container">
		{
			this.state.documents.map((item, key) => {
				let className = item.isVoting ? 'ent ent--static ent--vote' : 'ent ent--static ent--proposal';
				if ( item.id in this.state.minimized ) {
					className += ' is-minimized';
				}
				return (
			<div key={key} className="news-item">
				<div className={className}>
					<header className="obj-header ent-header">
						<div className="ent-title">{item.name}</div>
						<div className="obj-control ent-control">
							<button className="btn btn-expand btn-expand--show" type="button" title="Expand" onClick={ this.toggleDocument } data-modal-action="offer" data-page-id={item.id} data-parent-id={ this.props.data.id }></button>
						</div>
					</header>
					<div className="obj-body ent-body">
						<div className="ent-content">
							<div className="container">
								<div className="entry-path">> {item.category.name} >> {item.subcategory.name}</div>
								<div className="entry-body">
									<div className="entry-content">
										{ item.photos.length ? 
											<a href={item.photos[0].images['ligthbox']} data-fancybox={item.id}>
												<img className="entry-content__pic" src={item.photos[0].images['100x100']} alt="" width="100" height="100" alt=""/>
											</a>
											:
											''
										}
										{ item.brief ? 
											<div className="entry-content__text">{item.brief}</div>
											:
											''
										}
									</div>
									{this.offerDates(item)}
								</div>
								{ item.isVoting ?
								<VoteButtons document={item} changeUserHandler={this.props.changeUserHandler} showMessageHandler={ this.props.showMessageHandler }/>
									:
								<div className="entry-buttons">
									<LikeButton document={item} type="offer" changeUserHandler={this.props.changeUserHandler} showMessageHandler={ this.props.showMessageHandler }/>
								</div>
								}
								<div className="entry-time">{datetime(item.mtime)}</div>
							</div>
						</div>
					</div>
				</div>
			</div>
				)
			})
		}
		{ this.state.postInProcess ? <div>Loadding...</div>	: '' }
		{ this.state.hasMoreDocuments ? <a href="#" onClick={this.loadMoreDocuments}>Show more</a>	: '' }
		</div>
		)
	}
	
	topicsList() {
		if ( !this.state.documents.length ) {
			return <div className="container">List is empty</div>
		}
		
		return (
		<div className="container">
		{
			this.state.documents.map((item, key) => {
				let className = item.isVoting ? 'ent ent--static ent--vote' : 'ent ent--static ent--proposal';
				if ( item.id in this.state.minimized ) {
					className += ' is-minimized';
				}
				return (
			<div key={key} className="news-item">
				<div className={className}>
					<header className="obj-header ent-header">
						<div className="ent-title">{item.name}</div>
						<div className="obj-control ent-control">
							<button className="btn btn-expand btn-expand--show" type="button" title="Expand" onClick={ this.toggleDocument } data-modal-action="topic" data-page-id={item.id} data-parent-id={ this.props.data.id }></button>
						</div>
					</header>
					<div className="obj-body ent-body">
						<div className="ent-content">
							<div className="container">
								<div className="entry-path">> {item.category.name} >> {item.subcategory.name}</div>
								<div className="entry-body">
									<div className="entry-content">
										{ item.photos.length ? 
											<a href={item.photos[0].images['ligthbox']} data-fancybox={item.id}>
												<img className="entry-content__pic" src={item.photos[0].images['100x100']} alt="" width="100" height="100" alt=""/>
											</a>
											:
											''
										}
										{ item.brief ? 
											<div className="entry-content__text">{item.brief}</div>
											:
											''
										}
									</div>
									{this.offerDates(item)}
								</div>
								<div className="entry-buttons">
									<LikeButton document={item} type="topic" changeUserHandler={this.props.changeUserHandler} showMessageHandler={ this.props.showMessageHandler }/>
								</div>
								<div className="entry-time">{datetime(item.mtime)}</div>
							</div>
						</div>
					</div>
				</div>
			</div>
				)
			})
		}
		{ this.state.postInProcess ? <div>Loadding...</div>	: '' }
		{ this.state.hasMoreDocuments ? <a href="#" onClick={this.loadMoreDocuments}>Show more</a>	: '' }
		</div>
		)
	}
}

Project.contextType = DataContext;
