import $ from 'jquery';
import React, { Component } from 'react';

import { ContentTypeEnum } from './ContentManager.js';
import { MapTypeEnum } from './MapManager.js';
import GeoMap from './GeoMap.js';


class GeoMapManager extends Component {
	constructor(props) {
		super(props)
		this.contentManager_ = props.contentManager;
		this.geoMap_ = null;
	}

	handleHoverNode(nodeId, origin) {
		const geoId = this.contentManager_.getNode(nodeId).getGeoId();
		const $mapItem = $('#geo_map_' + geoId);
		$mapItem.addClass('hovered');
		if (origin == ContentTypeEnum.GRID) {
			this.geoMap_.flyToNode(geoId);
		}
	}

	handleUnhoverNode(nodeId, origin) {
		const geoId = this.contentManager_.getNode(nodeId).getGeoId();
		const $mapItem = $('#geo_map_' + geoId);
		$mapItem.removeClass('hovered');
	}

	handleFilterChange(filterType) {
		console.log('filter: ' + filterType);
		this.geoMap_.filter(filterType);
	}

	clearActiveNode() {
		this.geoMap_.resetFilters();
	}

	setActiveNode(nodeId) {
		const geoId = this.contentManager_.getNode(nodeId).getGeoId();
		this.geoMap_.setActiveNode(geoId);
	}

	render() {
		return (
			<div className="geo_map_manager">
				<button className="map_button" onClick = {() => {
					this.contentManager_.setMapType(MapTypeEnum.INFO);
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

