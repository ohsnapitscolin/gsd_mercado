import $ from 'jquery';
import React, { Component } from 'react';

import { MapTypeEnum } from './ContentManager.js';
import GeoMap from './GeoMap.js';


class GeoMapManager extends Component {
	constructor(props) {
		super(props)
		this.contentManager_ = props.contentManager;
		this.geoMap_ = null;
	}

	componentDidMount() {
		this.updateVisibility();
	}

	componentDidUpdate() {
		this.updateVisibility();
	}

	updateVisibility() {
		$(".geo_map_manager").css({
			"visibility": this.props.visible ? "visible" : "hidden"
		});
	}

	completeLoad() {
		return this.geoMap_.completeLoad();
	}

	handleActiveNodeChange(nodeId) {
		const geoId = this.contentManager_.getNode(nodeId).getGeoId();
		this.geoMap_.resetFocus();
		this.geoMap_.showGeoIds([geoId + ""]);
		this.geoMap_.flyToNode(geoId);
	}

	handleActiveTypeChange(typeId) {
		const geoIds = [];
		const nodes = this.contentManager_.getNodesForTypeId(typeId);
		for (let i = 0; i < nodes.length; i++) {
			geoIds.push(nodes[i].getGeoId() + "");
		}
		this.geoMap_.showGeoIds(geoIds);
	}

	handleActiveStoryChange(storyId) {
		const geoIds = [];
		const nodes = this.contentManager_.getNodesForStoryId(storyId);
		for (let i = 0; i < nodes.length; i++) {
			geoIds.push(nodes[i].getGeoId() + "");
		}
		this.geoMap_.showGeoIds(geoIds);
	}

	handleActiveFilterChange(filterType) {
		this.geoMap_.filter(filterType);
	}

	resetActives() {
		this.geoMap_.hideAllGeoNodes();
	}

	handleHoverNode(nodeId, origin) {
		const geoId = this.contentManager_.getNode(nodeId).getGeoId();
		const $mapItem = $('#geo-' + geoId);
		$mapItem.addClass('hovered');
		this.geoMap_.flyToNode(geoId);
	}

	handleUnhoverNode(nodeId, origin) {
		const geoId = this.contentManager_.getNode(nodeId).getGeoId();
		const $mapItem = $('#geo-' + geoId);
		$mapItem.removeClass('hovered');
	}

	setFocusedNode(nodeId) {
		const geoId = this.contentManager_.getNode(nodeId).getGeoId();
		this.geoMap_.flyToNode(geoId);
	}

	clearFocusedNode() {}

	render() {
		return (
			<div className="geo_map_manager">
				<button className="map_button" onClick = {() => {
					this.contentManager_.updateActiveMapType(MapTypeEnum.INFO);
				}}>
					Info!
				</button>
				<GeoMap
						contentManager = {this.contentManager_}
						ref={(node) => { this.geoMap_ = node; }} />
			</div>
		);
	}
}

export default GeoMapManager;

