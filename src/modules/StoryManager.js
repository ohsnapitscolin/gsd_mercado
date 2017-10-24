import $ from 'jquery';
import React, { Component } from 'react';

import Story from './Story.js'

import { GridTypeEnum } from './GridManager.js'

export const StoryTypeEnum = {
	NODE : 1,
  STORY : 2,
};


class StoryManager extends Component {
	constructor(props) {
		super(props)
		this.contentManager_ = props.contentManager;

		const nodeId = props.nodeId;
		const storyType = nodeId > -1 ? StoryTypeEnum.NODE : StoryTypeEnum.STORY;
		this.state = {
			type: StoryTypeEnum.NODE,
			storyId: 6
		};
	}

	renderStory() {
		return (
			<Story
				contentManager = {this.contentManager_}
				storyId = {this.state.storyId}/>
		);
	}

	clickStory(storyId) {
		this.setState({ type:StoryTypeEnum.STORY });
	}

	renderNode(nodeId) {
		let storyButtons = [];
		const storyNodes =
			this.contentManager_.getStoriesForNodeId(nodeId);
		for (let i = 0; i < storyNodes.length; i++) {
			const storyNode = storyNodes[i];
			storyButtons.push(
				<button onClick={() => { this.clickStory(storyNode.getId()); }}>
					{storyNode.getName()}
				</button>
			);
		}
		return (
			<div>
				{nodeId}
				{storyButtons}
			</div>
		);
	}

	render() {
		return (
			<div className="story_manager">
				<div>Unknown StoryManager</div>
				<button onClick={() => {
					this.contentManager_.setActiveNode(-1);
					this.contentManager_.setGridType(GridTypeEnum.SELECTION);
				}}>
					Back
				</button>
				{this.state.type == StoryTypeEnum.NODE ?
						this.renderNode(this.props.nodeId) : this.renderStory()}
			</div>
		);
	}
}

export default StoryManager;

