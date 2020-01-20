import React, { Component } from 'react'
import cookie from 'react-cookies'
import Autocomplete from 'react-autocomplete';
import { findDOMNode } from 'react-dom'

import { getRequest, getModalConfig, logout } from '../../api/API'
import {UserContext} from '../../context/User'
import { UserSex } from '../../core/Const'
import  { fileUploadA11y } from '../../core/Utils'

const Config = require('Config');

export default class Settings extends Component {
	constructor(props) {
		super(props);
		
		this.state = {
			form: {
				geo: '',
				country_id: undefined,
				city_id: undefined,
				name: '',
				surname: '',
				nickname: '',
				sex: undefined,
				birthdate: undefined,
				twitter_profile_url: '',
				facebook_profile_url: '',
				about: '',
				avatar: {}
			}, 
			error: undefined,
			errors: [],
			geoSearch: []
		};

		this.handleChange = this.handleChange.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
				
		this.onGeoChange = this.onGeoChange.bind(this);
		this.onGeoSelect = this.onGeoSelect.bind(this);
		this.getGeoValue = this.getGeoValue.bind(this);
		this.renderGeoItem = this.renderGeoItem.bind(this);
		this.retrieveDataAsynchronously = this.retrieveDataAsynchronously.bind(this);
		this.handleAvatarChange = this.handleAvatarChange.bind(this);
		this.deleteAvatarHandle = this.deleteAvatarHandle.bind(this);
		this.nullify = this.nullify.bind(this);
		this.doNullify = this.doNullify.bind(this);
	}
  
	componentWillMount () {
		const { user } = this.context;
		
		const form = Object.assign({}, user);
		
		const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(form.birthdate)
		if ( match ) {
			form['birthdate'] = sprintf('%02d/%02d/%d', match[3], match[2], match[1]);
		}
		this.setState({ form: form });
	}

	componentDidMount() {
		var $this = findDOMNode(this);
//		fileUploadA11y($this);
	}
  
	handleChange(event) {
		const form = this.state.form;
		
		if ( event.target.type === 'checkbox' ) {
			form[event.target.name] = event.target.checked ? event.target.value : '';
		}
		else {
			form[event.target.name] = event.target.value;
		}
		
		form.birthdate = birthdate.value
		
		this.setState({ form: form, errors: [] });
	}
	
	handleAvatarChange(e) {
		event.preventDefault();

		const form = this.state.form;

		let reader = new FileReader();
        let file = e.target.files[0];
        
        reader.onloadend = () => {
			form.avatar = {};
			form.avatar['100x100'] = reader.result;
			form.avatar['file'] = file;

            this.setState({ form: form });
        }
        
        reader.readAsDataURL(file)
	}

	handleSubmit(event) {
		event.preventDefault();
		const form = this.state.form;

		let { link, obj } = getRequest( 'settings' );
		
		link = link + event.target.getAttribute('action');

		const data = new FormData();
		if ( form.avatar ) {
			if ( form.avatar.file ) {
				data.append("avatar", form.avatar.file);
			}
			else if ( form.avatar.delete ) {
				data.append("del_avatar", form.avatar.delete);
			}
		}
		
		['name', 'surname', 'nickname', 'sex', 'country_id', 'city_id', 'geo', 'facebook_profile_url', 'twitter_profile_url', 'about'].map((el) => {
			if ( form[el] ) {
				data.append(el, form[el]);
			}
		});

		const match = /^(\d{2})\/(\d{2})\/(\d{4})/.exec(birthdate.value)
		if ( match ) {
			let val = sprintf('%4d-%02d-%02d', match[3], match[2], match[1]);
			data.append('birthdate', val);
			form.birthdate = birthdate.value;
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
						const context = this.context;
						context.changeUser(this.state.form);
						this.props.closeHandler(this.props.data.id)

					}
					
				},
				(error) => {
					this.setState({ error: error });
				}
			);
	}

	nullify() {
		this.props.showDialogHandler("Do you really want to delete this profile?", this.doNullify);
	}
	
	doNullify() {
		let { link, obj } = getRequest( 'nullify' );

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
						this.props.showMessageHandler({ title: 'Error', message: result.errors[0].descriptions[0].message });
					}
					else {
						logout();
					}
				}
			);
	}

	render() {
		const { user } = this.context;

		return (
			<div className="obj wnd wnd--you" id={ 'window-' + this.props.data.id } data-key={ this.props.data.id }>
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
					<div className="wnd-title">SETTINGS</div>
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
				<form action="users/me/edit/profile/" onSubmit={this.handleSubmit}>
				<div className="obj-body wnd-body">
					<div className="wnd-content">
						<main className="wnd-main">
							<div className="scroll-container">
								<div className="container">
									<div className="my-info">
										<div className="my-info-group my-info-group--middle">
											<div className="my-info-pic">
												{this.showAvatar(this.state.form.avatar)}
											</div>
											<div className="my-info-main">
												<div className="my-info-group">
													<div className="my-info-field">
														<label className="sr-only" htmlFor="nickname">Nickname</label>
														<input className="form-control form-control--flat" type="text" placeholder="Nickname" autoComplete="new-password" id="nickname" name="nickname" value={ this.state.form.nickname } onChange={this.handleChange} />
														{ this.showErrors('nickname') }
													</div>
													<div className="my-info-field my-info-field--size-s">
														<label className="sr-only" htmlFor="sex"></label>
														<select className="form-control" id="sex" name="sex" value={ this.state.form.sex } onChange={this.handleChange}>
															{Object.keys(UserSex).map((keyName, i) => (
																<option key={i} value={keyName}>{UserSex[keyName]}</option>
															))}															
														</select>
														{ this.showErrors('sex') }
													</div>
												</div>
												<div className="my-info-group">
													<div className="my-info-field">
														<label className="sr-only" htmlFor="name">First name</label>
														<input className="form-control form-control--flat" type="text" placeholder="First name" autoComplete="new-password" id="name" name="name" value={ this.state.form.name } onChange={this.handleChange} />
														{ this.showErrors('name') }
													</div>
													<div className="my-info-field">
														<label className="sr-only" htmlFor="surname">Last name</label>
														<input className="form-control form-control--flat" type="text" placeholder="Last name" autoComplete="new-password" id="surname" name="surname" value={ this.state.form.surname } onChange={this.handleChange} />
														{ this.showErrors('surname') }
													</div>
												</div>
												<div className="my-info-group">
													<div className="my-info-field">
														<label className="sr-only" htmlFor="name">City</label>
														<Autocomplete
															inputProps={{className: "form-control form-control--flat", placeholder: 'Geo' }}
															getItemValue={this.getGeoValue}
															items={this.state.geoSearch}
															renderItem={this.renderGeoItem}
															value={this.state.form.geo}
															onChange={this.onGeoChange}
															onSelect={this.onGeoSelect}
														/>
														{ this.showErrors('country_id') }
														{ this.showErrors('city_id') }
													</div>
													<div className="my-info-field">
														<label className="sr-only" htmlFor="birthdate">Birthdate</label>
														<input className="form-control form-control--flat date-input-mask" type="text" placeholder="Birthdate" autoComplete="new-password" id="birthdate" name="birthdate" value={ this.state.form.birthdate } onChange={this.handleChange} />
														{ this.showErrors('birthdate') }
													</div>
												</div>
											</div>
										</div>
										<div className="my-info-group">
											<div className="my-info-field">
												<label className="sr-only" htmlFor="facebook_profile_url">Facebook profile</label>
												<div className="my-info-field__inner"><span className="btn btn-social"><span className="btn__label btn__label--fb">f</span></span>
													<input className="form-control form-control--shaded" type="text" autoComplete="new-password" id="facebook_profile_url" name="facebook_profile_url" value={ this.state.form.facebook_profile_url } onChange={this.handleChange}/>
													{ this.showErrors('facebook_profile_url') }
												</div>
											</div>
											<div className="my-info-field">
												<label className="sr-only" htmlFor="twitter_profile_url">Twitter profile</label>
												<div className="my-info-field__inner"><span className="btn btn-social"><span className="btn__label btn__label--tw">Tw</span></span>
													<input className="form-control form-control--shaded" type="text" autoComplete="new-password" id="twitter_profile_url" name="twitter_profile_url" value={ this.state.form.twitter_profile_url } onChange={this.handleChange}/>
													{ this.showErrors('twitter_profile_url') }
												</div>
											</div>
										</div>
										<div className="my-info-group">
											<div className="my-info-field entry-about">
												<label className="sr-only" htmlFor="about">About</label>
												<textarea className="form-control" rows="4" type="text" id="about" placeholder="About" name="about" value={ this.state.form.about } onChange={this.handleChange}/>
												{ this.showErrors('about') }
											</div>
										</div>
										<div className="auth-form-submit">
											<button className="btn btn-default" type="submit">Save</button>
											&nbsp;
											<button className="btn btn-default" type="button" onClick={this.nullify}>Delete profile</button>
										</div>
										{
											!user.identityConfirmed ?
										<div className="video-manage" style={{ marginTop: '20px' }}>
											<div className="video-manage__inner">
												<div className="video-manage__text">You shoud activate your profile, for this please full white squares.</div>
												<div className="video-manage__btn">
													<button className="btn btn-default" type="button" onClick={ this.props.modalByClickHandler } data-modal-action="video_create">Activate</button>
												</div>
											</div>
											<div className="video-manage__icon"><img src="/i/general/film.svg" width="47" height="55" alt=""/></div>
										</div>
											:
											''
										}
									</div>
								</div>
							</div>
						</main>
					</div>
				</div>
				</form>
			</div>
		);
	}

    retrieveDataAsynchronously(searchText){
        let _this = this;
		
		let { link, obj } = getRequest( 'geo', searchText );
		
        let xhr = new XMLHttpRequest();
        xhr.open('GET', link, true);
        xhr.responseType = 'json';
        xhr.onload = () => {
            let status = xhr.status;

            if (status == 200) {
                _this.setState({
                    geoSearch: xhr.response.elements
                });
            }
        };

        xhr.send();
    }
    
    onGeoChange(e){
		const form = this.state.form;
		
		form['geo'] = e.target.value;
		form['country_id'] = undefined;
		form['city_id'] = undefined;
		
        this.setState({
            form: form
        });

        this.retrieveDataAsynchronously(e.target.value);
    }

    onGeoSelect(val, item){
		const form = this.state.form;
		if ( item.country ) {
			form['country_id'] = item.country.id;
			form['city_id'] = item.id;
		}
		else {
			form['country_id'] = item.id;
		}
		
		form['geo'] = val;
		
        this.setState({
            form: form
        });

    }

    renderGeoItem(item, isHighlighted){
		if ( item.country ) {
			return (
				<div key={item.id} style={{ background: isHighlighted ? 'lightgray' : 'white' }}>
					{item.country.name}, {item.name}
				</div>   
			)
		}
        return (
            <div key={item.id} style={{ background: isHighlighted ? 'lightgray' : 'white' }}>
                {item.name}
            </div>   
        ); 
    }

    getGeoValue(item){
		if ( item.country ) {
			return `${item.country.name}, ${item.name}`
		}
        return `${item.name}`;
    }
	
	showAvatar(data) {
		if ( data && data['100x100'] ) {
			return (
				<div className="avatar-wrapper">
					<img className="avatar-pic" src={data['100x100']} alt="" width="100" height="100"/>
					<button className="btn btn-trash" type="button" onClick={this.deleteAvatarHandle}>
						<span className="icon-group">
							<span className="icon-image">
								<img className="icon icon-trash" src="/i/general/icons/icon-trash.svg" alt="Trash icon" role="presentation"/>
							</span>
							<span className="icon-label">Trash</span>
						</span>
					</button>
				</div>
			)
		}
		
		return (
			<div className="avatar-wrapper">
				<div className="avatar-placeholder">
					<div className="addfile">
						<label className="label-addfile" htmlFor="avatar-fileupload">
							<span className="icon-group"  role="button"  tabIndex="0">
								<span className="icon-image">
									<img className="icon icon-folder" src="/i/general/icons/icon-folder.svg" alt="Add file icon" role="presentation"/>
								</span>
								<span className="icon-label">Add file</span>
							</span>
						</label>
						<input type="file" className="btn-addfile" id="avatar-fileupload" onChange={this.handleAvatarChange} />
					</div>
				</div>
			</div>
		);
	}
	
	deleteAvatarHandle(e) {
		const form = this.state.form;
		
		const avatar = {};
		avatar.delete = true;
		
		form['avatar'] = avatar;
		
        this.setState({
            form: form
        });
	}
	
	showErrors(key) {
		if ( key ) {
			return (
				<div> 
				{ this.state.errors.filter((element) => {
						return element.key === key;
					}).map((error, idx) => (
						<div key={idx} className="invalid-feedback">{error.descriptions[0].message}</div>
				)) }
				</div>
			)
		}
		return (
			<div>
			{ this.state.errors.map((error, idx) => (
					<div key={idx} className="invalid-feedback">{error.descriptions[0].message}</div>
			)) }
			</div>
		)
	}
}

Settings.contextType = UserContext;
