import React, { Component } from 'react';
import $ from 'jquery';

const StoryStateEnum = {
	LOADING: 0,
	IMAGES_LOADED: 1,
	LOADED: 2
}


class Story extends Component {
	constructor(props) {
		super(props);

		this.contentManager_ = props.contentManager;

		this.state = {
			loadingState: StoryStateEnum.LOADING
		}

		this.bufferTime_ = 500;
		this.images_ = new Map();

		try {
			this.story_ =
					require("../resources/stories/" + props.storyId + "/story.json");
		} catch(e) {
			this.story_ = null;
		}

		this.currentSegmentId_ = -1;

		this.resourcePromises_ = [];
		for (var imageId in this.story_.images) {
			this.resourcePromises_.push(this.importImage(
					props.storyId, imageId, this.story_.images[imageId])
			);
		}
		Promise.all(this.resourcePromises_).then(() => {
			this.setImagesLoaded();
			setTimeout(() => { this.setLoaded() }, this.bufferTime_)
		});
	}

	importImage(oid, imageId, imageName) {
		return import("../resources/stories/" + oid + "/images/" + imageName)
				.then((image) => {
					this.images_.set(imageId, image);
				});
	}

	componentDidMount() {}

	componentDidUpdate() {
		$('.story_scroll').on("scroll", () => {
			this.updateControllerHover();
		});
		if (this.state.loadingState == StoryStateEnum.LOADED) {
			this.updateControllerHover();
		}
	}

	updateControllerHover() {
		const currentSegmentId = this.getCurrentFocus();
		if (this.currentSegmentId_ != currentSegmentId) {
			const oldSegmentId = this.currentSegmentId_;
			this.currentSegmentId_ = currentSegmentId;

			$('#segment_control_' + oldSegmentId).removeClass("focused");
			$('#segment_control_' + this.currentSegmentId_).addClass("focused");

			if (this.currentSegmentId_ >= 0) {
				const activeNodeId = this.story_.segments[this.currentSegmentId_].node;
				console.log(activeNodeId);
				this.contentManager_.setFocusedNodeId(activeNodeId);
			}
		}
	}

	getCurrentFocus() {
		const segments = this.getSegments();
		const storyMiddle = $(".story_scroll").height() / 2;

		let currentSegmentId = -1;
		let distanceToMiddle = Number.MAX_SAFE_INTEGER;

		for (let pair of segments) {
			const segmentId = pair[0];
			const segment = pair[1];
			const currentDistanceToMiddle =
				($(segment).position().top - storyMiddle) * -1;

			if (currentDistanceToMiddle < 0) {
				break;
			} else if (currentDistanceToMiddle < distanceToMiddle) {
				currentSegmentId = segmentId;
				distanceToMiddle = currentDistanceToMiddle;
			}
		}
		return currentSegmentId;
	}

	getSegments() {
		let segments = new Map();
		$(".segment").each(function() {
    	const segmentId = $(this).attr('id').split('_')[1];
			segments.set(segmentId, this);
		});
		return segments;
	}

	setImagesLoaded() {
		this.setState({
			loadingState: StoryStateEnum.IMAGES_LOADED
		});
	}

	setLoaded() {
		this.setState({
			loadingState: StoryStateEnum.LOADED
		});
	}

	renderSegments() {
		var segments = [];
		var segmentsController = [];

		for (var i = 0; i < this.story_.segments.length; i++) {
			var segment = this.story_.segments[i];
			if (segment.type == 'image') {
				console.log(this.images_);
				console.log(segment.src);
				segments.push(
					<div className="segment image_segment" id={"segment_" + i}>
						{segment.name}
						<img
								className="image_segment_image"
								src={this.images_.get(segment.src)}/>
						{segment.description}
					</div>
				);
			} else if (segment.type == 'text') {
				segments.push(
					<div className="segment text_segment" id={"segment_" + i}>
						{segment.name}
						{segment.text}
					</div>
				);
			} else if (segment.type == 'video') {
				segments.push(
					<div className="segment video_segment" id={"segment_" + i}>
						{segment.name}
						<iframe
							className="video_segment_video"
							src={segment.src + "?rel=&wmode=Opaque&enablejsapi=1;showinfo=0;controls=0"}>
						</iframe>
						{segment.description}
					</div>
				);
			}
			segmentsController.push(this.getSegmentControl(i));
		}

		var imgs = [];
		for (var i = 0; i < this.images_.length; i++) {
			imgs.push(<img className="modal_image" src={this.images_[i]}/>);
		}
		return (
			<div className="story_scroll">
				<div className="story_segments">
					{segments}
				</div>
				<div className="segment_controller_wrapper">
					<div className="segment_controller">
						{segmentsController}
					</div>
				</div>
			</div>
		);
	}

	getSegmentControl(i) {
		return (
			<div
	 				className = "segment_control"
	 				id = {"segment_control_" + i}
					onClick = {() => {
						const realTop = $(".story_segments").position().top;
						$('.story_scroll').animate({
		        	scrollTop: $("#segment_" + i).position().top - realTop
			    	}, 500);
					}}
			/>
		);
	}

	maybeRenderLoading() {
		return (
			<div>
				<img src={require("../resources/loading.gif")}/>
			</div>
		);
	}

	render() {
		return (
			<div className="story" id={"story_" + this.props.storyId}>
				<div className="storyTitle">
					{this.props.storyId}
				</div>
				<div className="story_content">
					{ this.renderSegments() }
				</div>
			</div>
		);
	}
}

export default Story;