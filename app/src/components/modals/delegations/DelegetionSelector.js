import React, { Component } from 'react'
import cookie from 'react-cookies'

import { getRequest } from '../../../api/API'
import { DelegationTypeAll, DelegationTypeCategories, DelegationTypes } from '../../../core/Const'
import { DelegateContext } from '../../../context/Delegate'

const Config = require('Config');

export default class DelegetionSelector extends Component {
	constructor(props) {
		super(props);
		
		const ctx = this.context;
		
		this.state = {
			categoriesLoaded: false,
			delegatesLoaded: true,
		};
		
		this.handleChangeType = this.handleChangeType.bind(this);
		this.loadCategories = this.loadCategories.bind(this);
		
	}

	componentDidMount() {
		this.loadCategories();
	}
	
	handleChangeType(event) {
		this.context.updateType(event.target.value);
	}
	
	loadCategories() {
		const { link, obj } = getRequest('delegations_categories');

		const data = new FormData();
		data.append('project_id', this.props.projectId);
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
					const ctx = this.context;
					ctx.updateCategoriesList(result.elements);
					this.setState({ categoriesLoaded: true });
				},
				(error) => {
					const ctx = this.context;
					ctx.updateCategoriesList([]);
					this.setState({ categoriesLoaded: true });
				}
				
			);
	}

	render() {
		const { form, categoriesList } = this.context;

		return (
		<div>
		<div className="my-info-group">
			<div className="my-info-field">
				<select className="form-control" id="type" name="type" value={form.type} onChange={this.handleChangeType}>
				{
					Object.keys(DelegationTypes).map((id, i) => (
					<option key={i} value={id}>{DelegationTypes[id]}</option>
					))
				}
				</select>
			</div>
		</div>
		<div className="my-info-group">
			<div className="my-info-field">
				<label><input type="checkbox" name="clear_offers_delegations" value="1" checked={form.clear_offers_delegations} onChange={this.props.changeHandler}/> Separate all votes for which it is individually delegated</label>
				{
					form.type === DelegationTypeAll  ?
				<label><input type="checkbox" name="clear_categories_delegations" value="1" checked={form.clear_categories_delegations} onChange={this.props.changeHandler}/> Separate all categories for which it is individually delegated</label>
					:
					''
				}
			</div>
		</div>
				{
					form.type === DelegationTypeCategories && this.state.categoriesLoaded  ?
		<div className="my-info-group">
			<div className="my-info-field">
				<ul>
					{categoriesList.map((item, key) => (
					<li key={key}>
						<label><input type="checkbox" name="categories" value={item.id} checked={form.category_id.indexOf(item.id)>-1} onChange={this.props.changeCategories}/> {item.name} {
								item.delegate ? 
									<span>
										to <a href='#' onClick={this.props.modalByClickHandler} data-modal-action="profile" data-page-id={item.delegate.id}>{item.delegate.nickname}</a>
									</span>
								: 
								''
								}</label>
						{ this.showErrors(this.props.errors, item.id, 'category_id') }
					</li>
					))}
				</ul>
				{ this.props.showErrors('category_id') }
			</div>
		</div>
					:
					''
				}
		</div>
		);
	}

	showErrors(errors, id, key) {
		const className = 'invalid-feedback';
		const keyName = key + '_' + id;
		return (
			<div> 
			{ errors.filter((element) => {
					return element.key === keyName;
				}).map((error, idx) => (
					<div key={idx} className={className}>{error.descriptions[0].message}</div>
			)) }
			</div>
		)
	}
}
DelegetionSelector.contextType = DelegateContext;
