import React, { Component } from 'react'

import { getRequest } from '../../../api/API'
import {UserContext} from '../../../context/User'

import VideoPlayer from '../../VideoPlayer'

const Config = require('Config');

export default class VideoView extends Component {
	constructor(props) {
		super(props);
		
		this.state = {
			isComplained: true,
			videoJsOptions: {
			  autoplay: false,
			  controls: true,
			  sources: []
			}
		};
		
		this.loadVideo = this.loadVideo.bind(this);
		this.complain = this.complain.bind(this);
		this.doComplain = this.doComplain.bind(this);
	}
	
	componentDidMount() {
		this.loadVideo()
	}

	loadVideo() {
		let { link, obj } = getRequest('user_video', this.props.data.pageId);
		
		fetch(link, obj)
			.then((res) => {
				if ( res.status == 401 ) {
					cookie.remove(Config.authCookieName, { path: '/' });
					this.props.changeUserHandler({});
				}
				this.setState( { loadInProcess: false, hasMoreComments: false } );
				return res.json();
			})
			.then(
				(result) => {
					if ( result.videoURL ) {
						const opts = this.state.videoJsOptions;
						opts.sources.push({
							src: result.videoURL,
							type: 'video/mp4'
						});
						this.setState( { videoJsOptions: opts, isComplained: result.isComplained } );
					}
				}
			);
	}
	
	complain() {
		this.props.showDialogHandler("Do you really want to report this profile?", this.doComplain);
	}
	
	doComplain() {
		let { link, obj } = getRequest( 'user_video_complain', this.props.data.pageId );

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
					this.setState({ isComplained: true })
				}
			);
	}
	
	render() {
		const {user} = this.context;
		
		return (
			<div className="obj box box--sm box--video" id={ 'window-' + this.props.data.id } data-key={ this.props.data.id }>
				<header className="obj-header box-header">
					<div className="obj-control box-control">
						<button className="btn btn-close btn-close--sm" type="button" title="Close"></button>
					</div>
				</header>
				<div className="obj-body box-body">
					<div className="box-content">
						<main className="box-main">
							<div className="scroll-container">
								<div className="container">
									<div className="video-container">
										<div className="video-content">
										{
											this.state.videoJsOptions.sources.length ?
												<VideoPlayer { ...this.state.videoJsOptions } />
											:
											'Loading...'
										}
										</div>
										{
											user.id != this.props.data.pageId && !this.state.isComplained ?
										<div className="video-control">
											<button className="btn btn-default ml-auto" type="button" onClick={this.complain}>Report</button>
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
			</div>
		);
	}

}

VideoView.contextType = UserContext;
