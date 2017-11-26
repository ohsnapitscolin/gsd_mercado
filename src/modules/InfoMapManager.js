import $ from 'jquery';
import React, { Component } from 'react';

import { MapTypeEnum } from './ContentManager.js';
import InfoMap from './InfoMap.js'


class InfoMapManager extends Component {
	constructor(props) {
		super(props)
		this.contentManager_ = props.contentManager;

		this.infoMap_ = null;
	}

	componentDidMount() {
		this.updateVisibility();
	}

	componentDidUpdate() {
		this.updateVisibility();
	}

	updateVisibility() {
		$(".info_map_manager").css({
			"visibility": this.props.visible ? "visible" : "hidden"
		});
	}

	completeLoad() {
		return Promise.resolve();
	}

	showFilteredNodes(nodes) {
		this.infoMap_.setIgnoreHoverChanges(true);
		let typeIds = [];
		for (let i = 0; i < nodes.length; i++) {
			typeIds.push(nodes[i].getTypeId());
		}
		this.infoMap_.resetFocus();
		this.infoMap_.focusTypes(typeIds, true /* activeConnectionsOnly */);
	}

	handleActiveNodeChange(nodeId) {
		const typeId = this.contentManager_.getNode(nodeId).getTypeId();
		console.log("handleActiveNodeChange: " + typeId);
		this.infoMap_.setIgnoreHoverChanges(true);
		this.infoMap_.resetFocus();
		this.infoMap_.flyToNode(typeId);
		this.infoMap_.focusType(typeId);
	}

	handleActiveTypeChange(typeId) {
		this.infoMap_.setIgnoreHoverChanges(true);
		this.infoMap_.resetFocus();
		this.infoMap_.flyToNode(typeId);
		this.infoMap_.focusType(typeId);
	}

	handleActiveStoryChange(storyId) {
		if (storyId) {
			this.infoMap_.setIgnoreHoverChanges(true);
			const typeIds = [];
			const types = this.contentManager_.getTypesForStoryId(storyId);
			for (let i = 0; i < types.length; i++) {
				typeIds.push(types[i].getId());
			}
			this.infoMap_.focusTypes(typeIds, true /* activeConnectionsOnly */);
		}
	}

	handleActiveMaterialChange(materialId) {
		this.infoMap_.setIgnoreHoverChanges(true);
		this.infoMap_.resetFocus();
		const typeIds = [];
		const types = this.contentManager_.getTypesForMaterialId(materialId);
		for (let i = 0; i < types.length; i++) {
			typeIds.push(types[i].getId());
		}
		this.infoMap_.focusTypes(typeIds, true /* activeConnectionsOnly */);
	}

	handleActiveCharacterChange(characterId) {
		this.infoMap_.setIgnoreHoverChanges(true);
		this.infoMap_.resetFocus();
		const typeIds = [];
		const types = this.contentManager_.getTypesForCharacterId(characterId);
		for (let i = 0; i < types.length; i++) {
			typeIds.push(types[i].getId());
		}
		this.infoMap_.focusTypes(typeIds, true /* activeConnectionsOnly */);
	}

	resetActives() {
		this.infoMap_.setIgnoreHoverChanges(false);
		this.infoMap_.resetFocus();
	}

	handleHoverNode(geoId, typeId, flyTo) {
		this.infoMap_.handleHoverNode(typeId);
		if (flyTo) {
			this.infoMap_.flyToNode(typeId);
		}
	}

	handleUnhoverNode(geoId, typeId, hideOnHover) {
		this.infoMap_.handleUnhoverNode(typeId);
	}

	renderChapters(renderedChapters) {
		let typeIds = [];
		for (let i = 0; i < renderedChapters.length; i++) {
			const nodeId = renderedChapters[i].getNodeId();
			const typeId = renderedChapters[i].getTypeId();
			if (nodeId) {
				typeIds.push(this.contentManager_.getNode(nodeId).getTypeId());
			} else if (typeId) {
				typeIds.push(typeId);
			}
		}
		this.infoMap_.focusTypes(typeIds, true);
	}

	setFocusedNode(nodeId) {
		const typeId = this.contentManager_.getNode(nodeId).getTypeId();
		this.setFocus(null /* geoId */, typeId);
	}

	setFocus(geoId, typeId) {
		if (typeId) {
			this.infoMap_.setIgnoreHoverChanges(true);
			this.infoMap_.setFocusedNode(typeId);
		}
	}

	render() {
		return (
			<div className = "info_map_manager">
				<button id= "map_switch_button" onClick = {() => {
					this.contentManager_.updateActiveMapType(MapTypeEnum.GEO);
				}}>
					Geo!
				</button>
				<InfoMap
					contentManager = {this.contentManager_}
					ref = {(node) => { this.infoMap_ = node; }}
				/>
			</div>
		);
	}
}

export default InfoMapManager;

