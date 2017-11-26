import $ from 'jquery';
import React, { Component } from 'react';

import { GridTypeEnum } from './GridManager.js'

class Node extends Component {
	constructor(props) {
		super(props)
		this.contentManager_ = props.contentManager;
	}

	render() {
		let characterButtons = [];
		const characters =
				this.contentManager_.getCharactersForNodeId(this.props.nodeId);
		for (let i = 0; i < characters.length; i++) {
			const character = characters[i];
			characterButtons.push(
				<button onClick={() => {
					this.contentManager_.updateActiveCharacterId(character.getId());
				}}>
					{character.getName()}
				</button>
			);
		}

		let materialButtons = [];
		const materials =
				this.contentManager_.getMaterialsForNodeId(this.props.nodeId);
		for (let i = 0; i < materials.length; i++) {
			const material = materials[i];
			materialButtons.push(
				<button onClick={() => {
					this.contentManager_.updateActiveMaterialId(material.getId());
				}}>
					{material.getName()}
				</button>
			);
		}

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

		const nodeData = this.contentManager_.getNodeData(this.props.nodeId);
		return (
			<div className="node">
				<div>
					{this.props.nodeId} <br/>
					{nodeData.getName()} <br/>
					{nodeData.getWorkers()} <br/>
					{characterButtons} <br/>
					{materialButtons} <br/>
					{storyButtons}
				</div>
			</div>
		);
	}
}

export default Node;

