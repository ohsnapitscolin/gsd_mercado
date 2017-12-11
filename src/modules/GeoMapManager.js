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

	showFilteredNodes(nodes) {
		let geoIds = [];
		for (let i = 0; i < nodes.length; i++) {
			geoIds.push(nodes[i].getGeoId());
		}
		this.geoMap_.resetFocus();
		this.geoMap_.showGeoIds(geoIds, true);
	}

	handleActiveNodeChange(nodeId) {
		const geoId = this.contentManager_.getNode(nodeId).getGeoId();
		this.geoMap_.resetFocus();
		this.geoMap_.showGeoIds([geoId], true);
		this.geoMap_.flyToNode(geoId);
	}

	handleActiveTypeChange(typeId) {
		const geoIds = [];
		const nodes = this.contentManager_.getNodesForTypeId(typeId);
		for (let i = 0; i < nodes.length; i++) {
			geoIds.push(nodes[i].getGeoId());
		}
		this.geoMap_.showGeoIds(geoIds, true);
	}

	handleActiveStoryChange(storyId) {
		const geoIds = [];
		const nodes = this.contentManager_.getNodesForStoryId(storyId);
		for (let i = 0; i < nodes.length; i++) {
			geoIds.push(nodes[i].getGeoId());
		}
		this.geoMap_.showGeoIds(geoIds, true);
	}

	handleActiveMaterialChange(materialId) {
		const geoIds = [];
		const nodes = this.contentManager_.getNodesForMaterialId(materialId);
		for (let i = 0; i < nodes.length; i++) {
			geoIds.push(nodes[i].getGeoId());
		}
		this.geoMap_.showGeoIds(geoIds, true);
	}

	handleActiveCharacterChange(characterId) {
		const geoIds = [];
		const nodes = this.contentManager_.getNodesForCharacterId(characterId);
		for (let i = 0; i < nodes.length; i++) {
			geoIds.push(nodes[i].getGeoId());
		}
		this.geoMap_.showGeoIds(geoIds, true);
	}

	handleActiveFilterChange(filterType) {
		this.geoMap_.filter(filterType);
	}

	handleActiveOverlayChange(overlay) {
		this.geoMap_.updateOverlays(overlay);
	}

	resetActives() {
		this.geoMap_.hideAllGeoNodes();
	}

	handleHoverNode(geoId, typeId, flyTo, preview) {
		this.geoMap_.showGeoIds([geoId], false);
		this.geoMap_.animateGeoId(geoId);
		const $mapItem = $('#geo-' + geoId);
		$mapItem.addClass(preview ? 'preview' : 'hovered');
		if (flyTo) {
			this.geoMap_.flyToNode(geoId);
		}
	}

	handleUnhoverNode(geoId, typeId, hideOnHover) {
		if (hideOnHover) {
			this.geoMap_.hideGeoIds([geoId], false);
		}
		this.geoMap_.stopAnimation(geoId);
		const $mapItem = $('#geo-' + geoId);
		$mapItem.removeClass('hovered');
		$mapItem.removeClass('preview');
	}

	renderChapters(renderedChapters) {
		let geoIds = [];
		for (let i = 0; i < renderedChapters.length; i++) {
			const nodeId = renderedChapters[i].getNodeId();
			const geoId = renderedChapters[i].getGeoId();
			if (nodeId) {
				geoIds.push(this.contentManager_.getNode(nodeId).getGeoId());
			} else if (geoId) {
				geoIds.push(geoId);
			}
		}
		this.geoMap_.showGeoIds(geoIds, false);
	}

	setFocusedNode(nodeId) {
		const geoId = this.contentManager_.getNode(nodeId).getGeoId();
		this.setFocus(geoId, null /* typeId */);
	}

	setFocus(geoId, typeId) {
		if (geoId) {
			this.geoMap_.flyToNode(geoId);
		}
	}

	render() {
		return (
			<div className="geo_map_manager">
				<div className="geo_map_buttons">
					<button className="geo_map_button" onClick = {() => {
						this.contentManager_.updateActiveMapType(MapTypeEnum.INFO);
					}}>
						Info!
					</button>
					<button className="geo_map_button" onClick = {() => {
						this.contentManager_.updateActiveOverlay("salarios_a");
					}}>
						Overlay!
					</button>
					<button className="geo_map_button" onClick = {() => {
						this.contentManager_.updateActiveOverlay(null);
					}}>
						Hide!
					</button>
				</div>
				<GeoMap
						contentManager = {this.contentManager_}
						ref={(node) => { this.geoMap_ = node; }} />
			</div>
		);
	}
}

export default GeoMapManager;

