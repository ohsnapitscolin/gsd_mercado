import $ from 'jquery';
import React, { Component } from 'react';

import { MapTypeEnum } from './MapManager.js';
import InfoMap from './InfoMap.js'


class InfoMapManager extends Component {
	constructor(props) {
		super(props)
		this.contentManager_ = props.contentManager;

		this.infoMap_ = null;
	}

	handleHoverNode(nodeId, origin) {
		const typeId = this.contentManager_.getNode(nodeId).getTypeId();
		this.infoMap_.handleHoverNode(typeId);
		this.infoMap_.flyToNode(typeId);
	}

	handleUnhoverNode(nodeId, origin) {
		const typeId = this.contentManager_.getNode(nodeId).getTypeId();
		this.infoMap_.handleUnhoverNode(typeId);
	}

	render() {
		return (
			<div className = "info_map_manager">
				<button onClick = {() => {
					this.contentManager_.setMapType(MapTypeEnum.GEO);
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

