import React, { Component } from 'react'

import { Pages } from '../core/Const'

export default class Footer extends Component {
	render() {
		const today = new Date();
		return (
			<footer className="footer">
				<div className="layout">
					<div className="copyright">{today.getFullYear()} Runubar</div>
					<ul className="service-links">
					{
						Object.keys(Pages).map((key, i) => (
						<li key={i} className="service-links__item"><a className="service-links__link" href="#" onClick={ this.props.modalByClickHandler } data-modal-action="page" data-page-id={key}>{Pages[key]}</a></li>
						))
					}
						<li className="service-links__item"><a className="service-links__link" href="#" onClick={ this.props.modalByClickHandler } data-modal-title="FAQ" data-modal-action="faq">FAQ</a></li>
					</ul>
					<div className="follow-links">Follow us: <a className="follow-links__link" href="#">Fb</a> <a className="follow-links__link" href="#">Inst</a></div>
				</div>
			</footer>
		);
	}
}
