import React, { Component } from 'react'
import { findDOMNode } from 'react-dom'
import RecordRTC from 'recordrtc';

import { getRequest } from '../../../api/API'
import {UserContext} from '../../../context/User'

const Config = require('Config');
                        
export default class VideoForm extends Component {
	constructor(props) {
		super(props);
		
		this.state = {
			video: null,
			videoStream: null,
			error: null,
			errors: [],
			recording: false,
			videoBlob: null,
			recordVideo: null,
			postInProcess: false,
		};

		this.handleSubmit = this.handleSubmit.bind(this);
		this.handleVideoFileChange = this.handleVideoFileChange.bind(this);
		this.closeWindow = this.closeWindow.bind(this);
		this.clearVideo = this.clearVideo.bind(this);
		this.initWebcam = this.initWebcam.bind(this);
		this.startRecording = this.startRecording.bind(this);
		this.stopRecording = this.stopRecording.bind(this);
	}

	componentDidMount() {
		this.initWebcam();
	}
	
	initWebcam() {
		let _this = this;
		navigator.mediaDevices.getUserMedia({
			audio: true,
			video: { 
				width: 840, 
				height: 535
			}
		})
		.then(function(stream) {
			_this.setState({ videoStream: stream });
			var video = document.querySelector('#cam_video');
			video.srcObject = stream;
			video.onloadedmetadata = function(e) {
				video.play();
			};
		})
		.catch(function(err) {
			_this.setState({ error: "Your browser cannot stream from your webcam. Please switch to Chrome or Firefox." });
		});
	}

	
	startRecording() {
		let recordVideo = RecordRTC(this.state.videoStream, { type: 'video/mp4' });
		recordVideo.startRecording();
		this.setState({ recordVideo: recordVideo, recording: true });
	}
	
	stopRecording() {
		let recordVideo = this.state.recordVideo;

		recordVideo.stopRecording(() => {
			var uploadData = {
				name: 'video.mp4',
				data: recordVideo.blob,
			}

			this.setState({ videoBlob: uploadData, recordVideo: null, recording: false, });
		});
	}
	
	clearVideo(e) {
		event.preventDefault();
		
        this.setState({ video: null, recordVideo: null, recording: false, videoStream: null, videoBlob: null });
        this.initWebcam();
	}
		
	handleSubmit(event) {
		event.preventDefault();
		
		if ( this.state.postInProcess ) {
			return false;
		}
		
		this.setState({ postInProcess: true });
		
		let { link, obj } = getRequest( 'video_create' );
		
		const data = new FormData();

		if ( this.state.videoBlob ) {
			data.append("video", this.state.videoBlob.data, this.state.videoBlob.name);
		}
		else if ( this.state.video ) {
			data.append("video", this.state.video);
		}

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
						this.setState({ errors: result.errors, postInProcess: false })
					}
					else {
						const { user } = this.context;
						
						user.identityConfirmed = true;
						
						this.context.changeUser(user);
						this.props.closeHandler(this.props.data.id)
						this.setState({ postInProcess: false })
					}

				},
				(error) => {
					this.setState({ error: error, postInProcess: false });
				}
			);
	}

	handleVideoFileChange(e) {
		event.preventDefault();

        let file = e.target.files[0];
        this.setState({ video: file, recordVideo: null, recording: false, videoStream: null, videoBlob: null });
	}
	
	closeWindow() {
		this.props.closeHandler(this.props.data.id);
	}

	render() {
		return (
			<div className="obj box box--video-verification" id={ 'window-' + this.props.data.id } data-key={ this.props.data.id }>
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
									<div className="verification-title">Video varification</div>
									<div className="verification">
										<div className="verification-content">
											<div className="verification-text">
												<p>You shoud activate your profile.For this here you can take a video with your face, or add some file. We need this for  confidence that you are the real man who you want to be seem.</p>
												<p>Here the example:</p>
											</div>
											<div className="verification-video">
												<div className="video-container">
													<div className="video-content">
														<div className="embed-responsive embed-responsive-330by210">
															<iframe width="560" height="315" src="https://www.youtube.com/embed/ScMzIvxBSi4?controls=0" frameBorder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowFullScreen={true}></iframe>
														</div>
													</div>
												</div>
												<div className="video-control">
													<button className="btn btn-default" type="button" onClick={this.closeWindow}>Cancel</button>
												{
													this.state.video || this.state.videoBlob ?
													<button className="btn btn-default" type="button" onClick={this.handleSubmit}>Activate</button>
													:
													''
												}
												</div>
											</div>
										</div>
										<div className="video-container">
											<div className="video-content">
											{
												this.state.error ?
												<p>{this.state.error}</p>
												:
												this.state.video ?
												<p>{this.state.video.name}</p>
												:
												this.state.videoStream ?
												<div className="embed-responsive embed-responsive-330by210">
													<video id="cam_video"></video>
												</div>
												:
												<p>Loading...</p>
											}
											</div>
											{ this.showErrors('video') }
											{ this.showErrors('system') }
											<div className="video-control">
												<div className="addfile">
													<label className="label-addfile" htmlFor="video-fileupload">
														<span className="icon-group" role="button" tabIndex="0">
															<span className="icon-image">
																<img className="icon icon-folder" src="/i/general/icons/icon-folder.svg" alt="Add file icon" role="presentation"/>
															</span>
															<span className="icon-label">Add file</span>
														</span>
													</label>
													<input className="btn-addfile" type="file" id="video-fileupload" onChange={this.handleVideoFileChange} disabled={this.state.video || this.state.videoBlob || this.state.recording}/>
												</div>
												<button className="btn btn-default" type="button" onClick={this.startRecording} disabled={this.state.video || this.state.videoBlob || this.state.recording}><span className="dot-rec">•</span> REC</button>
												<button className="btn btn-default" type="button" onClick={this.stopRecording} disabled={this.state.video || this.state.videoBlob || !this.state.recording}><span className="dot-rec dot-rec--stop">•</span> STOP</button>
												<button className="btn btn-trash" type="button" onClick={this.clearVideo} disabled={!(this.state.videoBlob || this.state.video)}><span className="icon-group"><span className="icon-image"><img className="icon icon-trash" src="/i/general/icons/icon-trash.svg" alt="Trash icon" role="presentation"/></span><span className="icon-label">Trash</span></span></button>
											</div>
										</div>
									</div>
								</div>
							</div>
						</main>
					</div>
				</div>
			</div>
		);
	}

	showErrors(key) {
		if ( key ) {
			return (
				<div> 
				{ this.state.errors.filter((element) => {
						return element.key === key;
					}).map((error, idx) => (
						<div key={idx} className="invalid-feedback1">{error.descriptions[0].message}</div>
				)) }
				</div>
			)
		}
		return (
			<div>
			{ this.state.errors.map((error, idx) => (
					<div key={idx} className="invalid-feedback1">{error.descriptions[0].message}</div>
			)) }
			</div>
		)
	}
}

VideoForm.contextType = UserContext;
