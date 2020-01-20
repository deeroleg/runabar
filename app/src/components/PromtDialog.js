import React, { Component } from 'react'
import { findDOMNode } from 'react-dom'

import { interaction } from '../core/Utils'

export default class PromtDialog extends Component {
	constructor(props) {
		super(props);
		
		this.state = { 
			value: '',
		};
		
		this.okHandler = this.okHandler.bind(this);
		this.changeHandler = this.changeHandler.bind(this);
	}
	
	okHandler () {
		this.props.data.onOkHandler(this.state.value);
		this.props.closeHandler(this.props.data.id);
	}
	
	changeHandler(e) {
		this.setState({
			value: event.target.value,
		});
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
					<div className="dlg-form">
						<input className="form-control form-control--flat" type="text" value={this.state.value} onChange={this.changeHandler}/>
					</div>
					<div className="dlg-actions">
						<button className="btn btn-default btn-default--light" type="button" onClick={this.okHandler}>Send</button>
					</div>
				</div>
			</div>
		</div>
		);
	}
}
