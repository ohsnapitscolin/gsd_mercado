import $ from 'jquery';
import React, { Component } from 'react';

import { GridTypeEnum } from './GridManager.js'

class Material extends Component {
	constructor(props) {
		super(props)
		this.contentManager_ = props.contentManager;
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
					<br/>
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

