import React, { Component } from 'react'

import {UserContext} from '../../context/User'

export default class Intro extends Component {
	constructor(props) {
		super(props);
		this.state = {
		};
	}
  
	render() {
		const { user } = this.context;
		
		return (
			<div className="obj wnd wnd--intro" id={ 'window-' + this.props.data.id } data-key={ this.props.data.id }>
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
					<div className="wnd-title">Hello {user ? ' '  + user.nickname : ''}!</div>
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
									<div className="intro-title">Let's have a look what can you do</div>
									<div className="intro-cols">
										<div className="intro-cols__item">
											<div className="intro-subtitle">whithout authorization</div>
											<ul className="intro-options">
												<li className="intro-options__item">
													<p>to view the news feed</p>
													<p><span className="icon-group"><span className="icon-image"><img className="icon icon-news" src="/i/general/icons/icon-news.svg" alt="News icon" role="presentation"/></span><span className="icon-label">News</span></span></p>
												</li>
											</ul>
										</div>
										<div className="intro-cols__item">
											<div className="intro-subtitle">whith authorization</div>
											<ul className="intro-options">
												<li className="intro-options__item">
													<p>to decide which proposals will advance to a vote</p>
													<p><span className="icon-group"><span className="icon-image"><img className="icon icon-proposal" src="/i/general/icons/icon-proposal.svg" alt="Proposal icon" role="presentation"/></span><span className="icon-label">Proposal</span></span></p>
												</li>
												<li className="intro-options__item">
													<p>to take a part in the voiting</p>
													<p><span className="icon-group"><span className="icon-image"><img className="icon icon-votes" src="/i/general/icons/icon-votes.svg" alt="Votes icon" role="presentation"/></span><span className="icon-label">Votes</span></span></p>
												</li>
												<li className="intro-options__item">
													<p>leave comments and chat</p>
													<p><span className="icon-group"><span className="icon-image"><img className="icon icon-chat" src="/i/general/icons/icon-chat.svg" alt="Chat icon" role="presentation"/></span><span className="icon-label">Chat</span></span></p>
												</li>
											</ul>
										</div>
									</div>
									<div className="intro-continue">
										<div className="intro-continue__text">To continiue authorizatoin full your profile</div>
										<div className="intro-continue__link">
											<a href="#" onClick={ this.props.modalByClickHandler } data-modal-action="settings"><span className="icon-group"><span className="icon-image"><img className="icon icon-user" src="/i/general/icons/icon-user.svg" alt="Profile icon" role="presentation"/></span><span className="icon-label">Profile</span></span></a>
										</div>
									</div>
									<div className="intro-help">
										<p><a href="#" onClick={ this.props.modalByClickHandler } data-modal-title="FAQ" data-modal-action="faq">take a look at main issues of our project</a></p>
										<p><a href="#" onClick={ this.props.modalByClickHandler } data-modal-action="page" data-page-id="support">if you need some help</a></p>
									</div>
								</div>
							</div>
						</main>
					</div>
				</div>
			</div>
		);
	}
	
}

Intro.contextType = UserContext;
