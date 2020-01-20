import React, { Component } from 'react'
import cookie from 'react-cookies'
import { sprintf } from 'sprintf-js'
import { findDOMNode } from 'react-dom'

import { getRequest, getModalConfig } from '../../api/API'
import {UserContext} from '../../context/User'
import { VotingPerodShort, VotingPeriods } from '../../core/Const'
import  { fileUploadA11y } from '../../core/Utils'

const Config = require('Config');

export default class NewOffer extends Component {
	constructor(props) {
		super(props);
		
		this.state = {
			form: {
				name: '',
				category_id: undefined,
				subcategory_id: undefined,
				end_datetime: undefined,
				brief: '',
				body: '',
				implementation_costs: '',
				time_costs: '',
				advantages: '',
				disadvantages: '',
				expert_opinion: '',
				voting_period: VotingPerodShort,
				photos: [],
			},
			fieldTab: 'advantages',
			categoriesList: [],
			subcategoriesList: [],
			error: undefined,
			defaultCategoryId: this.props.data.categoryId,
			defaultSubcategoryId: this.props.data.subcategoryId,
			errors: []
		};

		this.handleChange = this.handleChange.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
		this.handleTab = this.handleTab.bind(this);
		this.loadCategories = this.loadCategories.bind(this);
		this.handleChangeCategoryId = this.handleChangeCategoryId.bind(this);
		this.handlePhotoChange = this.handlePhotoChange.bind(this);
		this.deletePhotoHandle = this.deletePhotoHandle.bind(this);
	}

	componentDidMount() {
		this.loadCategories();
		var $this = findDOMNode(this);
//		fileUploadA11y($this);
	}

	handleChange(event) {
		const form = this.state.form;
		
		form[event.target.name] = event.target.value;
		this.setState({ form: form, errors: [] });
	}
	
	handleSubmit(event) {
		event.preventDefault();
		const form = this.state.form;

		let { link, obj } = getRequest( 'new-offer', this.props.data.projectId );
		
		const data = new FormData();

		if ( form.photos.length ) {
			for ( let i = 0; i < form.photos.length; i++ ) {
				data.append("photos", form.photos[i].file);
			}
		}

		['name', 'category_id', 'subcategory_id', 'brief', 'body', 'implementation_costs', 'time_costs', 'advantages', 'disadvantages', 'expert_opinion', 'voting_period'].map((el) => {
			if ( form[el] ) {
				data.append(el, form[el]);
			}
		});

		const match = /^(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2})/.exec(end_datetime.value)
		if ( match ) {
			let val = sprintf('%4d-%02d-%02dT%02d:%02d:23', match[3], match[2], match[1], match[4], match[5]);
			data.append('end_datetime', val);
			form.end_datetime = end_datetime.value;
		}
		this.setState({ form: form });

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
					if ( result.result == 'error' ) {
						this.setState({ errors: result.errors })
					}
					else {
						this.props.closeHandler(this.props.data.id);
						this.props.data.successHandler(this.props.data.projectId);
					}
					
				},
				(error) => {
					this.setState({ error: error });
				}
			);
	}

	handleTab(event) {
		const type = event.currentTarget.getAttribute('data-type');
		
		this.setState({ fieldTab: type });
	}

	loadCategories() {
		const { link, obj } = getRequest('categories', this.props.data.projectId);
		
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
					const form = this.state.form;
					
					if ( result.elements.length ) {
						if ( this.state.defaultCategoryId ) {
							form.category_id = this.state.defaultCategoryId;
						}
						else {
							form.category_id = result.elements[0].id;
						}
					}
					else {
						form.category_id = undefined;
					}
					
					this.setState({ categoriesList: result.elements, form: form, defaultCategoryId: undefined });
					this.handleChangeCategoryId();
				},
				(error) => {
					const form = this.state.form;
					form.category_id = undefined;
					form.subcategory_id = undefined;

					this.setState({ categoriesList: [], form: form });
					this.handleChangeCategoryId();
				}
			);
	}
	
	handleChangeCategoryId() {
		const catId = category_id.value;
		
		const { link, obj } = getRequest('subcategories', catId);

		const form = this.state.form;
		form.subcategory_id = undefined;
		form.category_id = catId;
		this.setState({ form: form, subcategoriesList: [] });

		if ( !catId ) {
			return false;
		}
		
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
					const form = this.state.form;
					
					if ( result.elements.length ) {
						if ( this.state.defaultSubcategoryId ) {
							form.subcategory_id = this.state.defaultSubcategoryId;
						}
						else {
							form.subcategory_id = result.elements[0].id;
						}
					}
					else {
						form.subcategory_id = undefined;
					}
					
					this.setState({ subcategoriesList: result.elements, form: form, defaultSubcategoryId: undefined });
				},
				(error) => {
					const form = this.state.form;
					form.subcategory_id = undefined;

					this.setState({ subcategoriesList: [], form: form });
				}
			);
	}

	handlePhotoChange(e) {
		event.preventDefault();

		const form = this.state.form;

		let reader = new FileReader();
        let file = e.target.files[0];
        
        reader.onloadend = () => {
			const photo = {};
			photo['100x100'] = reader.result;
			photo['file'] = file;
			
			form.photos.push(photo);

            this.setState({ form: form });
        }
        
        reader.readAsDataURL(file)
	}

	deletePhotoHandle(event) {
		const form = this.state.form;
		
		const indx = event.currentTarget.getAttribute('data-key')
		
		form.photos.splice(indx, 1);

        this.setState({
            form: form
        });
	}

	render() {
		return (
			<div className="obj ent ent--modal ent--new" id={ 'window-' + this.props.data.id } data-key={ this.props.data.id }>
				<header className="obj-header ent-header">
					<div className="obj-control ent-control">
						<button className="btn btn-min btn-min--hide" type="button" title="Minimize"></button>
					</div>
					<div className="ent-title">
						<input className="form-control" type="text" name="name" placeholder="Name" value={this.state.form.name} onChange={this.handleChange}/>
					</div>
					<div className="obj-control ent-control">
						<button className="btn btn-close" type="button" title="Close"></button>
					</div>
				</header>
				<div className="obj-body ent-body">
					<div className="ent-content">
						{this.showErrors('system', 'invalid-feedback--heading')}
						{this.showErrors('name', 'invalid-feedback--heading')}
						<div className="container">
							{
								this.state.categoriesList.length || this.state.subcategoriesList.length ?
									<div className="my-info-group">
										<div className="my-info-field">
									{
										this.state.categoriesList.length ?
											<select className="form-control" id="category_id" name="category_id" value={ this.state.form.category_id } onChange={this.handleChangeCategoryId}>
												{this.state.categoriesList.map((item, key) => (
													<option key={key} value={item.id}>{item.name}</option>
												))}															
											</select>
										:
											<select className="form-control" id="category_id" name="category_id">
													<option value=''>Select category</option>
											</select>
									}
											{ this.showErrors('category_id') }
										</div>
										<div className="my-info-field">
									{
										this.state.subcategoriesList.length ?
											<select className="form-control" id="subcategory_id" name="subcategory_id" value={ this.state.form.subcategory_id } onChange={this.handleChange}>
												{this.state.subcategoriesList.map((item, key) => (
													<option key={key} value={item.id}>{item.name}</option>
												))}															
											</select>
										:
											<select className="form-control" id="subcategory_id" name="subcategory_id">
													<option value=''>Select subcategory</option>
											</select>
									}
											{ this.showErrors('subcategory_id') }
										</div>
								</div>
								:
								''
							}
							<div className="entry-head">
								<div className="entry-info">
									<div className="entry-info__head">
										<div className="entry-pic">
										{ this.state.form.photos.map((item, key) => {
											var errorKey = 'photo' + (parseInt(key)+1);
											return (
											<div>
												<div className="avatar-wrapper" key={key}>
													<img className="avatar-pic" src={item['100x100']} alt="" width="100" height="100"/>
													<button className="btn btn-trash" type="button" onClick={this.deletePhotoHandle} data-key={key}>
														<span className="icon-group">
															<span className="icon-image">
																<img className="icon icon-trash" src="/i/general/icons/icon-trash.svg" alt="Trash icon" role="presentation"/>
															</span>
															<span className="icon-label">Trash</span>
														</span>
													</button>
												</div>
												{this.showErrors(errorKey)}
											</div>
											)
											})
										}
											<div className="avatar-placeholder">
												<div className="addfile">
													<label className="label-addfile" htmlFor="offer-fileupload">
														<span className="icon-group" role="button" role="button"  tabIndex="0">
															<span className="icon-image">
																<img className="icon icon-folder" src="/i/general/icons/icon-folder.svg" alt="Add file icon" role="presentation"/>
															</span>
															<span className="icon-label">Add file</span>
														</span>
													</label>
													<input type="file" className="btn-addfile" id="offer-fileupload" onChange={this.handlePhotoChange} />
												</div>
											</div>
											{this.showErrors('photos')}
										</div>
										<div className="entry-data">
											<div className="form-group">
												<div className="entry-data__item">
													<img className="icon icon-time" src="/i/general/icons/icon-time.svg" alt="Time icon" role="presentation"/>
													<input className="form-control" type="text" name="time_costs" placeholder="Time cost" value={this.state.form.time_costs} onChange={this.handleChange}/>
												</div>
												{this.showErrors('time_costs')}
											</div>
											<div className="form-group">
												<div className="entry-data__item">
													<img className="icon icon-money" src="/i/general/icons/icon-money.svg" alt="Money icon" role="presentation"/>
													<input className="form-control" type="text" name="implementation_costs" placeholder="Implementation cost" value={this.state.form.implementation_costs} onChange={this.handleChange}/>
												</div>
												{this.showErrors('implementation_costs')}
											</div>
											<div className="entry-tags">
												<textarea className="form-control" placeholder="Short description" rows="4" name="brief" value={ this.state.form.brief } onChange={this.handleChange}></textarea>
												{this.showErrors('brief')}
											</div>
										</div>
									</div>
								</div>
								<div className="entry-thoughts">
									<ul className="nav-tabs nav-tabs--sm" role="tablist">
										<li className="nav-item"><span className="btn-tab-wrapper">
											<button className={this.state.fieldTab == 'advantages' ? 'btn btn-tab is-active' : 'btn btn-tab'} type="button" role="tab" onClick={this.handleTab} data-type="advantages">Plus</button></span>
										</li>
										<li className="nav-item"><span className="btn-tab-wrapper">
											<button className={this.state.fieldTab == 'disadvantages' ? 'btn btn-tab is-active' : 'btn btn-tab'} type="button" role="tab" onClick={this.handleTab} data-type="disadvantages">Minus</button></span>
										</li>
										<li className="nav-item"><span className="btn-tab-wrapper">
											<button className={this.state.fieldTab == 'expert_opinion' ? 'btn btn-tab is-active' : 'btn btn-tab'} type="button" role="tab" onClick={this.handleTab} data-type="expert_opinion">Expert</button></span>
										</li>
									</ul>
									{ this.state.fieldTab == 'advantages' ?
									<div className="entry-thoughts-body">
										<textarea className="form-control" rows="4" name="advantages" value={ this.state.form.advantages } onChange={this.handleChange} placeholder="Plus"></textarea>
										{this.showErrors('advantages')}
									</div>
										:
										''
									}
									{ this.state.fieldTab == 'disadvantages' ?
									<div className="entry-thoughts-body">
										<textarea className="form-control" rows="4" name="disadvantages" value={ this.state.form.disadvantages } onChange={this.handleChange} placeholder="Minus"></textarea>
										{this.showErrors('disadvantages')}
									</div>
										:
										''
									}
									{ this.state.fieldTab == 'expert_opinion' ?
									<div className="entry-thoughts-body">
										<textarea className="form-control" rows="4" name="expert_opinion" value={ this.state.form.expert_opinion } onChange={this.handleChange} placeholder="Expert"></textarea>
										{this.showErrors('expert_opinion')}
									</div>
										:
										''
									}
								</div>
							</div>
							<div className="my-info-group">
								<div className="my-info-field">
									<label htmlFor="end_datetime">End time</label>
									<input className="form-control datetime-input-mask" type="text" placeholder="End time" id="end_datetime" name="end_datetime" value={ this.state.form.end_datetime } onChange={this.handleChange} />
									{ this.showErrors('end_datetime') }
								</div>
								<div className="my-info-field">
									<label htmlFor="voting_period">Voting period</label>
									<select className="form-control" id="sex" name="voting_period" value={ this.state.form.voting_period } onChange={this.handleChange}>
										{Object.keys(VotingPeriods).map((keyName, i) => (
											<option key={i} value={keyName}>{VotingPeriods[keyName]}</option>
										))}															
									</select>
									{ this.showErrors('voting_period') }
								</div>
							</div>
							<div className="form-layout form-layout--reverse form-layout--about">
								<div className="form-layout__main">
									<div className="entry-about">
										<textarea className="form-control" placeholder="Description" rows="4" name="body" value={ this.state.form.body } onChange={this.handleChange}></textarea>
										{this.showErrors('body')}
									</div>
								</div>
								<div className="form-layout__side">
									<div className="entry-buttons">
										<span className="entry-button-group">
											<button onClick={this.handleSubmit} className="btn btn-default" type="button">Publish</button>
										</span>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}

	showErrors(key, addClass) {
		const className = addClass ? 'invalid-feedback ' + addClass : 'invalid-feedback';
		if ( key ) {
			return (
				<div> 
				{ this.state.errors.filter((element) => {
						return element.key === key;
					}).map((error, idx) => (
						<div key={idx} className={className}>{error.descriptions[0].message}</div>
				)) }
				</div>
			)
		}
		return (
			<div>
			{ this.state.errors.map((error, idx) => (
					<div key={idx} className={className}>{error.descriptions[0].message}</div>
			)) }
			</div>
		)
	}
}
