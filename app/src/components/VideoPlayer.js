import React from 'react';
import videojs from 'video.js'

export default class VideoPlayer extends React.Component {
	componentDidMount() {
		this.player = videojs(this.videoNode, this.props, function onPlayerReady() {});
	}
	componentWillUnmount() {
		if (this.player) {
			this.player.dispose()
		}
	}

	render() {
		return (
			<div data-vjs-player>
				<video ref={ node => this.videoNode = node } className="video-js vjs-big-play-centered" width="330" height="210"></video>
			</div>
		)
	}
}
