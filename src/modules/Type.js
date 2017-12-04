import React, { Component } from 'react';

import { ResourceStateEnum } from './ContentManager.js';
import TextParser from './TextParser.js';


class TypeRename extends Component {
	constructor(props) {
		super(props)
		this.contentManager_ = props.contentManager;

		this.state = {
			resourceState: ResourceStateEnum.LOADING
		}

		this.imageMap_ = new Map();
		this.loadResources().then(() => {
			this.setState({
				resourceState: ResourceStateEnum.LOADED
			});
		});
	}

	loadResources() {
		let resourcePromises = [];
		const typeData = this.contentManager_.getTypeData(this.props.typeId);
		const images = typeData.getImages();
		for (let i = 0; i < images.length; i++) {
			resourcePromises.push(this.importImage(this.props.typeId, images[i]));
		}
		return Promise.all(resourcePromises);
	}

	importImage(typeId, imageName) {
		return import(`../resources/images/types/${typeId}/${imageName}`)
				.then((image) => {
					this.imageMap_.set(imageName, image);
				});
	}

	render() {
		const typeData = this.contentManager_.getTypeData(this.props.typeId);

		let nodeButtons = [];
		const nodes = this.contentManager_.getNodesForTypeId(this.props.typeId);
		for (let i = 0; i < nodes.length; i++) {
			const node = nodes[i];
			nodeButtons.push(
				<button onClick={() => {
					this.contentManager_.updateActiveNodeId(node.getId());
				}}>
					{node.getName()}
				</button>
			);
		}

		return (
			<div className="type">
				<div>
					{this.props.typeId}
					{TextParser.parseText(
							typeData.getText(), "type", this.imageMap_)} <br/>
					{nodeButtons}
				</div>
			</div>
		);
	}
}

export default TypeRename;

