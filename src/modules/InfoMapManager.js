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

	handleActiveFilterChange(filterType) {

	}

	resetActives() {
		this.infoMap_.setIgnoreHoverChanges(false);
		this.infoMap_.resetFocus();
	}

	handleHoverNode(nodeId) {
		const typeId = this.contentManager_.getNode(nodeId).getTypeId();
		this.infoMap_.handleHoverNode(typeId);
		this.infoMap_.flyToNode(typeId);
	}

	handleUnhoverNode(nodeId) {
		const typeId = this.contentManager_.getNode(nodeId).getTypeId();
		this.infoMap_.handleUnhoverNode(typeId);
	}

	setFocusedNode(nodeId) {
		this.infoMap_.setIgnoreHoverChanges(true);
		const typeId = this.contentManager_.getNode(nodeId).getTypeId();
		this.infoMap_.setFocusedNode(typeId);
	}

	clearFocusedNode() {
		this.infoMap_.clearFocusedNode();
	}

	render() {
		return (
			<div className = "info_map_manager">
				<button onClick = {() => {
					this.contentManager_.updateActiveMapType(MapTypeEnum.GEO);
				}}>
					Geo!
				</button>
				<div>
					InfoMapManager
				</div>
				<InfoMap
					contentManager = {this.contentManager_}
					ref = {(node) => { this.infoMap_ = node; }}
				/>
			</div>
		);
	}
}

export default InfoMapManager;

