import React, { Component } from 'react'
import { render } from 'react-dom'
import Modal from './Modal'
import Header from './Header'
import Footer from './Footer'
import Message from './Message'
import Dialog from './Dialog'
import PromtDialog from './PromtDialog'
import { initClickHandlers } from '../core/Utils'
import { Pages } from '../core/Const'
import { UserContext } from '../context/User'
import { DataContext } from '../context/Data'
import { authenticate, logout } from '../api/API'

export default class App extends Component {
	constructor(props) {
		super(props);

		this.changeUser = (info) => {
			this.setState({ user: info });
		}

		this.isLogged = () => {
			return this.state.user && this.state.user.id;
		}

		this.updateLikes = (type, document) => {
			const likes = this.state.likes;
			
			if ( !likes[type] ) {
				likes[type] = {};
			}
			
			likes[type][document.id] = {
				likesCount: document.likesCount,
				liked: document.liked,
			}

			this.setState({ likes: likes });
		}

		this.updateVotes = (document) => {
			const votes = this.state.votes;
			
			votes[document.id] = {
				votesCount: document.votesCount,
				voted: document.voted,
				delegated: document.delegated
			}

			this.setState({ votes: votes });
		}

		this.state = { 
			modals: [], 
			dialogs: [],
			counter: 0,
			user: {},
			likes: {},
			votes: {},
			changeUser: this.changeUser,
			updateLikes: this.updateLikes,
			updateVotes: this.updateVotes,
			isLogged: this.isLogged,
		};

		this.openModal = this.openModal.bind(this);
		this.openModalByClick = this.openModalByClick.bind(this);
		this.closeModal = this.closeModal.bind(this);
		this.closeDocument = this.closeDocument.bind(this);
		this.logoutHandler = this.logoutHandler.bind(this);
		this.updateCategoriesTree = this.updateCategoriesTree.bind(this);
		this.updateDocumetnsList = this.updateDocumetnsList.bind(this);
		this.expandOffer = this.expandOffer.bind(this);
		this.expandTopic = this.expandTopic.bind(this);
		this.showMessage = this.showMessage.bind(this);
		this.showDialog = this.showDialog.bind(this);
		this.showPromt = this.showPromt.bind(this);
		this.closeDialog = this.closeDialog.bind(this);
	}
	
	componentWillMount () {
		authenticate(this.changeUser);
		
		const sp = new URLSearchParams(location.search);
		const rememering = sp.get("password_confirm");
		if ( rememering ) {
			const item = {
				id: this.state.counter,
				action: 'password_reset_finish',
				pageId: rememering,
			};
			
			this.setState({ modals: [...this.state.modals, item], counter: this.state.counter+1 }); 
		}
		const page = sp.get("page");
		if ( page && Pages.hasOwnProperty(page) ) {
			const item = {
				id: this.state.counter,
				action: 'page',
				pageId: page
			};
			
			this.setState({ modals: [...this.state.modals, item], counter: this.state.counter+1 }); 
		}
	}
	
	componentDidMount() {
		initClickHandlers();
	}

	logoutHandler(event) {
		event.preventDefault();
		
		logout();
	}
	
	showDialog(message, onOkHandler, objId) {
		const item = {
			id: this.state.counter,
			title: "Report",
			onOkHandler: onOkHandler,
			message: message,
			objId: objId
		};
		
		this.setState({ dialogs: [...this.state.dialogs, item], counter: this.state.counter+1 }); 
	}

	showPromt(message, paramName, onOkHandler) {
		const item = {
			id: this.state.counter,
			title: "Error",
			paramName: paramName,
			onOkHandler: onOkHandler,
			message: message,
		};
		
		this.setState({ dialogs: [...this.state.dialogs, item], counter: this.state.counter+1 }); 
	}
	
	showMessage(opts) {
		const item = {
			id: this.state.counter,
			title: opts.title,
			message: opts.message,
		};
		
		this.setState({ dialogs: [...this.state.dialogs, item], counter: this.state.counter+1 }); 
	}
	
  	openModalByClick(event) {
		event.preventDefault();
		const item = {
			id: this.state.counter,
			title: $(event.currentTarget).attr('data-modal-title'),
			action: $(event.currentTarget).attr('data-modal-action'),
			pageId: $(event.currentTarget).attr('data-page-id'),
			parentId: $(event.currentTarget).attr('data-parent-id'),
			projectId: $(event.currentTarget).attr('data-project-id'),
			categoryId: $(event.currentTarget).attr('data-category-id'),
			subcategoryId: $(event.currentTarget).attr('data-subcategory-id'),
		};
		
		if ( item.projectId ) {
			if ( item.action == 'new-category' ) {
				item['successHandler'] = this.updateCategoriesTree;
			}
			else if  ( item.action == 'new-offer' || item.action == 'new-topic' ) {
				item['successHandler'] = this.updateDocumetnsList;
			}
		}

		if ( item.parentId ) {
			if  ( item.action == 'offer' ) {
				item['closeHandler'] = this.expandOffer;
			}
			else if  ( item.action == 'topic' ) {
				item['closeHandler'] = this.expandTopic;
			}
		}

		this.setState({ modals: [...this.state.modals, item], counter: this.state.counter+1 }); 
	}

  	openModal(action) {
		const item = {
			id: this.state.counter,
			action: action,
		};
		
		this.setState({ modals: [...this.state.modals, item], counter: this.state.counter+1 }); 
	}

	closeModal(id) {
		this.setState({ modals: this.state.modals.filter(item => (item.id != id && item.parentId != id )) });
	}

	closeDialog(id) {
		this.setState({ dialogs: this.state.dialogs.filter(item => (item.id != id )) });
	}	
	/*
	 * 
	 * Закрывает предложение
	 * 
	 */
	closeDocument(event) {
		event.preventDefault();
		
		const action = $(event.currentTarget).attr('data-modal-action');
		const documentId = $(event.currentTarget).attr('data-page-id'); 
		const parentId = $(event.currentTarget).attr('data-parent-id'); 

		this.setState({ modals: this.state.modals.filter(item => ( item.pageId != documentId || item.action != action || item.parentId != parentId ) ) });
	}
	
	/*
	 * 
	 * Разворачивает предложение в списке предложений проекта
	 * 
	 */
	expandOffer(pageId, offerId) {
		this.state.modals.map((item) => {
			if ( item.action == 'project' && item.id == pageId ) {
				item.ref.current.expandOffer(offerId);
			}
		});
	}

	/*
	 * 
	 * Разворачивает тему форума в списке тем проекта
	 * 
	 */
	expandTopic(pageId, topicId) {
		this.state.modals.map((item) => {
			if ( item.action == 'project' && item.id == pageId ) {
				item.ref.current.expandTopic(topicId);
			}
		});
	}

	/*
	 * 
	 * Обновляет дерево категорий в окнах откртых проектов
	 * 
	 */
	updateCategoriesTree(projectId) {
		this.state.modals.map((item) => {
			if ( item.action == 'project' && item.pageId == projectId ) {
				item.ref.current.updateCategoriesTree();
			}
		});
	}

	/*
	 * 
	 * Обновляет список предложений в окнах откртых проектов
	 * 
	 */
	updateDocumetnsList(projectId) {
		this.state.modals.map((item) => {
			if ( item.action == 'project' && item.pageId == projectId ) {
				item.ref.current.updateDocumetnsList();
			}
		});
	}
	
	render() {
		return (
			 <DataContext.Provider value={this.state}>
				 <UserContext.Provider value={this.state}>
					<Header modalByClickHandler={ this.openModalByClick } logoutHandler={ this.logoutHandler } changeUserHandler={ this.changeUser } />
					<div className="desktop" id="desktop">
						{
							this.state.modals.map((element) => {
								const myRef = React.createRef();
								element['ref'] = myRef;
								return <Modal modalHandler={ this.openModal } modalByClickHandler={ this.openModalByClick } showMessageHandler={ this.showMessage } showDialogHandler={ this.showDialog } showPromtHandler={ this.showPromt } ref={myRef} key={element.id} data={element} closeModalByClickHandler={ this.closeDocument } closeHandler={ this.closeModal } changeUserHandler={ this.changeUser } />
							})
						}
						{
							this.state.dialogs.map((element) => {
								const myRef = React.createRef();
								element['ref'] = myRef;
								return (
									element.onOkHandler ?
										element.paramName ?
									<PromtDialog ref={myRef} key={element.id} closeHandler={ this.closeDialog } data={element} />
										:
									<Dialog ref={myRef} key={element.id} closeHandler={ this.closeDialog } data={element} />
									:
									<Message ref={myRef} key={element.id} closeHandler={ this.closeDialog } data={element} />
								);
							})
						}
					</div>
					<Footer modalByClickHandler={ this.openModalByClick } />
				</UserContext.Provider>
			</DataContext.Provider>
		);
	}
}

App.contextType = UserContext;
