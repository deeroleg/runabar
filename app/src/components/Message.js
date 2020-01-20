import React, { Component } from 'react'
import { findDOMNode } from 'react-dom'

import { interaction } from '../core/Utils'

export default class Message extends Component {
	constructor(props) {
		super(props);
		this.closeDialog = this.closeDialog.bind(this);
	}
	
	closeDialog () {
		this.props.closeHandler(this.props.data.id);
	}
	
	componentDidMount() {
		var $this = findDOMNode(this);
		interaction($this, this.props.closeHandler);
	}

	render() {
		return (
		<div className="obj dlg" id="dlg-report-profile">
			<header className="obj-header dlg-header">
				<div className="dlg-title">{this.props.data.title}</div>
			</header>
			<div className="obj-body dlg-body">
				<div className="dlg-content">
					<div className="dlg-query">{this.props.data.message}</div>
					<div className="dlg-actions">
						<button className="btn btn-default btn-default--light" type="button" onClick={this.closeDialog}>OK</button>
					</div>
				</div>
			</div>
		</div>
		);
	}
}
