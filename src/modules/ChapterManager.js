import React, { Component } from 'react';
import $ from 'jquery';
import PubSub from 'pubsub-js';

import ChapterData from './ChapterData.js';

export const FOCUSED_CHAPTER_CHANGE_EVENT = "chapterMananger.focusedChapterChangeEvent";
export const RENDERED_CHAPTERS_CHANGE_EVENT = "chapterMananger.renderedChaptersChangeEvent";

class ChapterManager {
	constructor(storyId, contentManager) {
		this.contentManager_ = contentManager;
		this.chapterMap_ = new Map();

		const storyObject = require("../resources/stories/" + storyId + ".json");
		for (let i = 0; i < storyObject.chapters.length; i++) {
			const chapterData = new ChapterData(storyObject.chapters[i]);
			this.chapterMap_.set(chapterData.getId(), chapterData);
		}

		const initialChapterId = storyObject.chapters ?
				storyObject.chapters[0].id : null;

		this.focusedChapterId_  = initialChapterId || null,
		this.renderedChapterIds_ = initialChapterId ? [initialChapterId] : [];

	}

	getChapterData(chapterId) {
		return this.chapterMap_.get(chapterId) || null;
	}

	setFocusedChapterId(focusedChapterId) {
		if (this.focusedChapterId_ != focusedChapterId) {
			this.focusedChapterId_ = focusedChapterId;
			PubSub.publish(FOCUSED_CHAPTER_CHANGE_EVENT);
		}
	}

	getFocusedChapterId() {
		return this.focusedChapterId_;
	}

	addRenderedChapterId(chapterId) {
		this.focusedChapterId_ = chapterId;
		this.renderedChapterIds_.push(chapterId);
		PubSub.publish(RENDERED_CHAPTERS_CHANGE_EVENT);
	}

	getRenderedChapterIds() {
		return this.renderedChapterIds_;
	}

	showDecisions(chapterId) {
		const lastIndex = this.renderedChapterIds_.length - 1;
		return this.renderedChapterIds_[lastIndex] == chapterId;
	}

	getRenderedGeoIds() {
		const renderedGeoIds = [];
		this.getRenderedChapterIds().forEach((chapterId) => {
			const chapterData = this.chapterMap_.get(chapterId);
			if (chapterData.getNodeId()) {
				const nodeData = this.contentManager_.getNodeData(
						chapterData.getNodeId());
				if (nodeData.getGeoId()) {
					renderedGeoIds.push(nodeData.getGeoId());
				}
			} else if (chapterData.getGeoId()) {
				renderedGeoIds.push(chapterData.getGeoId());
			}
		});
		return renderedGeoIds;
	}
}

export default ChapterManager;
