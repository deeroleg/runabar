import React, { Component } from 'react'
import { findDOMNode } from 'react-dom'
import { Parser } from 'html-to-react'
import cookie from 'react-cookies'

import { interaction } from '../core/Utils'
import { getRequest, getModalConfig } from '../api/API'
import {UserContext} from '../context/User'

const htmlParser = new Parser();

const Config = require('Config');

export default class Modal extends Component {
	constructor(props) {
		super(props);
		this.state = { 
			form: {}, 
			error: null,
			isLoaded: false,
			title: null, 
			textBody: null,
			elements: [] 
		};
		this.componentRef = React.createRef();
		this.updateCategoriesTree = this.updateCategoriesTree.bind(this);
		this.addQuestionButton = this.addQuestionButton.bind(this);
	}

	componentDidMount() {
		const modalConfig = getModalConfig(this.props.data.action);
		
		if ( modalConfig.compName ) {
		}
		else {
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
						this.setState({ isLoaded: true, elements: result.elements || [], title: result.name, textBody: result.body });
					},
					(error) => {
						this.setState({ isLoaded: true, error: error });
					}
				);
		}
		var $this = findDOMNode(this);
		interaction($this, this.props.closeHandler);
	}

	/*
	 * 
	 * Разворачивает предложение в списке предложений проекта
	 * 
	 */
	expandOffer(docId) {
		this.componentRef.current.expandOffer(docId);
	}

	/*
	 * 
	 * Разворачивает тему форума в списке тем проекта
	 * 
	 */
	expandTopic(docId) {
		this.componentRef.current.expandTopic(docId);
	}

	/*
	 * 
	 * Обновляет дерево категорий в окнах откртых проектов
	 * 
	 */
	updateCategoriesTree() {
		this.componentRef.current.loadCategories();
	}

	/*
	 * 
	 * Обновляет сптсок документов в окнах откртых проектов
	 * 
	 */
	updateDocumetnsList() {
		this.componentRef.current.reloadDocuments();
	}

	render() {
		const modalConfig = getModalConfig(this.props.data.action);
		if ( modalConfig.compName ) {
			const CompName = modalConfig.compName;
			return <CompName ref={this.componentRef} data={this.props.data} closeHandler={this.props.closeHandler} changeUserHandler={this.props.changeUserHandler} showMessageHandler={ this.props.showMessageHandler } showDialogHandler={ this.props.showDialogHandler }  showPromtHandler={ this.props.showPromtHandler } modalHandler={ this.props.modalHandler } modalByClickHandler={ this.props.modalByClickHandler } closeModalByClickHandler={ this.props.closeModalByClickHandler } />;
		} else {
			const { error, isLoaded, elements, title, textBody } = this.state;
			
			let body = <div>Loading...</div>;
			if ( isLoaded ) {
				if ( error ) {
					body = <div className="text-danger">{error}</div>
				}
				else if ( modalConfig.single ) {
					body = htmlParser.parse(textBody);
				}
				else if ( modalConfig.list ) {
					body = <div>
						{
							elements.map((element) => (
							<div key={element.id}><h2>{element.name}</h2>{htmlParser.parse(element.body)}</div>
							))
						}
						
						</div>;
				}
			}
			return (
				<div className="obj wnd wnd--info" id={ 'window-' + this.props.data.id } data-key={ this.props.data.id }>
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
						<div className="wnd-title">{ title || this.props.data.title }</div>
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
										{this.addQuestionButton()}
										{body}
									</div>
								</div>
							</main>
						</div>
					</div>
				</div>
			);
		}
	}
	
	addQuestionButton() {
		const { isLogged } = this.context;
		
		if ( this.props.data.action == 'faq' && isLogged() ) {
			return (
				<p>
					<button onClick={this.props.modalByClickHandler} data-modal-action="new-question" className="btn btn-default btn-block" type="button">Ask question</button>
				</p>
			);
		}
		
		return '';
	}
}

Modal.contextType = UserContext;
