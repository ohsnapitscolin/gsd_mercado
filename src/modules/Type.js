import $ from 'jquery';
import React, { Component } from 'react';

import { GridTypeEnum } from './GridManager.js'

class TypeRename extends Component {
	constructor(props) {
		super(props)
		this.contentManager_ = props.contentManager;
	}

	render() {
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
					{nodeButtons}
				</div>
			</div>
		);
	}
}

export default TypeRename;

