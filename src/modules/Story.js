import React, { Component } from 'react';
import $ from 'jquery';
import PubSub from 'pubsub-js';

import Chapter from './Chapter.js';
import ChapterManager, {
		FOCUSED_CHAPTER_CHANGE_EVENT,
		RENDERED_CHAPTERS_CHANGE_EVENT } from './ChapterManager.js';
import { ResourceStateEnum } from './ContentManager.js';

class Story extends Component {
	constructor(props) {
		super(props);

		this.contentManager_ = props.contentManager;

		this.bufferTime_ = 500;
		this.imagesMap_ = new Map();

		this.chapterManager_ = new ChapterManager(
				props.storyId, this.contentManager_);

		this.chapterManager_.loadResources().then(() => {
			this.setState({
				resourceState: ResourceStateEnum.LOADED
			});
		});

		this.tokens_ = [];
		this.tokens_.push(PubSub.subscribe(
				FOCUSED_CHAPTER_CHANGE_EVENT,
				this.handleFocusedChapterChanged.bind(this)));
		this.tokens_.push(PubSub.subscribe(
				RENDERED_CHAPTERS_CHANGE_EVENT,
				this.handleRenderedChaptersChanged.bind(this)));

		const focusedChapterId = this.chapterManager_.getFocusedChapterId();
		this.state = {
			resourceState: ResourceStateEnum.LOADING,
			focusedChapterId: focusedChapterId,
			renderedChapterIds: this.chapterManager_.getRenderedChapterIds()
		}

		this.contentManager_.appendRenderedChapter(
				this.chapterManager_.getChapterData(focusedChapterId));
	}

	componentDidMount() {
		this.updateFocusedChapterId();
	}

	componentDidUpdate() {
		this.updateFocusedChapterId();
	}

	style() {
		const thisStory = this;
		$(".chapter").each(function() {
			const chapterId = $(this).attr('id').split("-")[1];
			if (thisStory.state.focusedChapterId === chapterId) {
				$(this).addClass('selected');
			} else {
				$(this).removeClass('selected');
			}
		});
	}

	handleFocusedChapterChanged(e, data) {
		this.setState({
			focusedChapterId: this.chapterManager_.getFocusedChapterId()
		});
	}

	handleRenderedChaptersChanged(e, data) {
		const chapterId = this.chapterManager_.getFocusedChapterId();
		this.setState({
			focusedChapterId: chapterId,
			renderedChapterIds: this.chapterManager_.getRenderedChapterIds()
		});
		this.contentManager_.appendRenderedChapter(
				this.chapterManager_.getChapterData(chapterId));
		const scrollHeight = $('.grid_manager').prop("scrollHeight");
		$('.grid_manager').animate({ scrollTop: scrollHeight}, 0);
	}

	updateFocusedChapterId() {
		this.style();
		const chapterData = this.chapterManager_.getChapterData(
				this.chapterManager_.getFocusedChapterId());
		if (chapterData) {
			const nodeId = chapterData.getNodeId();
			const geoId = chapterData.getGeoId();
			const typeId = chapterData.getTypeId();

			if (nodeId) {
				this.contentManager_.setFocusedNodeId(nodeId);
			} else {
				if (geoId) {
					this.contentManager_.setFocusedGeoId(geoId);
				}
				if (typeId) {
					this.contentManager_.setFocusedTypeId(typeId);
				}
			}
		}
	}

	render() {
		let chapters = [];
		for (let i = 0; i < this.state.renderedChapterIds.length; i++) {
			const chapterData = this.chapterManager_.getChapterData(
					this.state.renderedChapterIds[i]);
			chapters.push(
				<Chapter
					key = {chapterData.getId()}
					id = {chapterData.getId()}
					contentManager = {this.contentManager_}
					chapterManager = {this.chapterManager_} />
			);
		}

		return (
			<div className="story" id={"story_" + this.props.storyId}>
				<div className="chapters">
					{chapters}
				</div>
			</div>
		);
	}
}

export default Story;