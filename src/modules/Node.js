import $ from 'jquery';
import React, { Component } from 'react';

import { GridTypeEnum } from './GridManager.js'

class NodeRename extends Component {
	constructor(props) {
		super(props)
		this.contentManager_ = props.contentManager;
	}

	render() {
		let storyButtons = [];
		const storyNodes =
				this.contentManager_.getStoriesForNodeId(this.props.nodeId);
		for (let i = 0; i < storyNodes.length; i++) {
			const storyNode = storyNodes[i];
			storyButtons.push(
				<button onClick={() => {
					this.contentManager_.updateActiveStoryId(storyNode.getId());
				}}>
					{storyNode.getName()}
				</button>
			);
		}

		return (
			<div className="node">
				<div>
					{this.props.nodeId}
					{storyButtons}
				</div>
			</div>
		);
	}
}

export default NodeRename;

