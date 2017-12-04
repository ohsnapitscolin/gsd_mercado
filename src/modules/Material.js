import React, { Component } from 'react';

import { ResourceStateEnum } from './ContentManager.js';
import TextParser from './TextParser.js';

class Material extends Component {
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
		const materialData = this.contentManager_.getMaterialData(
				this.props.materialId);
		const images = materialData.getImages();
		for (let i = 0; i < images.length; i++) {
			resourcePromises.push(this.importImage(this.props.materialId, images[i]));
		}
		return Promise.all(resourcePromises);
	}

	importImage(materialId, imageName) {
		return import(`../resources/images/materials/${materialId}/${imageName}`)
				.then((image) => {
					this.imageMap_.set(imageName, image);
				});
	}

	render() {
		let nodeButtons = [];
		const nodes =
				this.contentManager_.getNodesForMaterialId(this.props.materialId);
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

		let characterButtons = [];
		const characters =
				this.contentManager_.getCharactersForMaterialId(this.props.materialId);
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

		const materialData = this.contentManager_.getMaterialData(
				this.props.materialId);
		return (
			<div className="material">
				<div>
					{this.props.materialId}
					<br/>
					{materialData.getName()}
					{TextParser.parseText(
							materialData.getText(), "material", this.imageMap_)} <br/>
					{nodeButtons}
					<br/>
					{characterButtons}
					<br/>
				</div>
			</div>
		);
	}
}

export default Material;

