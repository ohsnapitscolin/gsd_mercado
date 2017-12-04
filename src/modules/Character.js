import React, { Component } from 'react';

import { ResourceStateEnum } from './ContentManager.js';
import TextParser from './TextParser.js';


class Character extends Component {
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
		const characterData = this.contentManager_.getCharacterData(
				this.props.characterId);
		const images = characterData.getImages();
		for (let i = 0; i < images.length; i++) {
			resourcePromises.push(this.importImage(
					this.props.characterId, images[i]));
		}
		return Promise.all(resourcePromises);
	}

	importImage(characterId, imageName) {
		return import(`../resources/images/characters/${characterId}/${imageName}`)
				.then((image) => {
					this.imageMap_.set(imageName, image);
				});
	}

	render() {
		let nodeButtons = [];
		const nodes =
				this.contentManager_.getNodesForCharacterId(this.props.characterId);
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

		let materialButtons = [];
		const materials =
				this.contentManager_.getMaterialsForCharacterId(this.props.characterId);
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

		const characterData = this.contentManager_.getCharacterData(
				this.props.characterId);
		return (
			<div className="character">
				<div>
					{this.props.characterId} <br/>
					{characterData.getName()} <br/>
					{characterData.getFormality()} <br/>
					{characterData.getJob()} <br/>
					{characterData.getPayType()} <br/>
					{characterData.getHome()} <br/>
					{TextParser.parseText(
							characterData.getText(), "character", this.imageMap_)} <br/>
					{nodeButtons} <br/>
					{materialButtons}
				</div>
			</div>
		);
	}
}

export default Character;

