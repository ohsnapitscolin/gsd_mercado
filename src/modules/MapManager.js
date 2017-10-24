import $ from 'jquery';
import React, { Component } from 'react';
import PubSub from 'pubsub-js'

import GeoMapManager from './GeoMapManager.js'
import InfoMapManager from './InfoMapManager.js'
import {
	FILTER_TYPE_CHANGE_EVENT,
	MAP_TYPE_CHANGE_EVENT,
	HOVER_NODE_EVENT,
	UNHOVER_NODE_EVENT,
	ACTIVE_NODE_CHANGE_EVENT } from './ContentManager.js'

export const MapTypeEnum = {
	NONE : 0,
	GEO : 1,
  INFO : 2,
};


class MapManager extends Component {
	constructor(props) {
		super(props)
		this.contentManager_ = props.contentManager;
		this.currentManager_ = null;

		this.tokens_ = [];
		this.tokens_.push(PubSub.subscribe(
				MAP_TYPE_CHANGE_EVENT, this.handleMapTypeChange.bind(this)));
		this.tokens_.push(PubSub.subscribe(
				HOVER_NODE_EVENT, this.handleHoverNode.bind(this)));
		this.tokens_.push(PubSub.subscribe(
				UNHOVER_NODE_EVENT, this.handleUnhoverNode.bind(this)));
		this.tokens_.push(PubSub.subscribe(
				FILTER_TYPE_CHANGE_EVENT, this.handleFilterTypeChange.bind(this)));
		this.tokens_.push(PubSub.subscribe(
				ACTIVE_NODE_CHANGE_EVENT, this.handleAcitveNodeChange.bind(this)));

		this.state = {
			type: MapTypeEnum.INFO
		};
	}

	componentDidMount() {
		// this.contract(2000);
	}

  expand(timeout) {
    $('.map_manager').animate({width: '50%'}, timeout);
  }

  contract(timeout) {
    $('.map_manager').animate({width: '0%'}, timeout);
  }

	handleActiveNodeChange(e, activeNodeId) {}

	handleHoverNode(e, data) {
		this.currentManager_.handleHoverNode(data.nodeId, data.origin);
	}

	handleUnhoverNode(e, data) {
		this.currentManager_.handleUnhoverNode(data.nodeId, data.origin);
	}

	handleNodeClick(e, nodeId) {
		this.currentManager_.handleNodeClick(nodeId);
	}

	handleFilterTypeChange(e, filterType) {
		console.log(filterType);
		this.currentManager_.handleFilterChange(filterType);
	}

	handleMapTypeChange(e, mapType) {
		this.setState({ type: mapType });
	}

	handleAcitveNodeChange(e, data) {
		const nodeId = data.nodeId;
		console.log(nodeId);
		if (nodeId < 0) {
			this.currentManager_.clearActiveNode();
		} else {
			this.currentManager_.setActiveNode(nodeId);
		}
	}

	renderMapType() {
		switch(this.state.type) {
			case MapTypeEnum.GEO:
				return (
					<GeoMapManager
							contentManager = {this.contentManager_}
							ref={(node) => { this.currentManager_ = node; }}/>
				);
			case MapTypeEnum.INFO:
				return (
					<InfoMapManager
							contentManager = {this.contentManager_}
							ref={(node) => { this.currentManager_ = node; }} />
				);
		}
		return (
			<div>Unknown MapManager</div>
		);
	}

	render() {
		return (
			<div className="map_manager">
				{this.renderMapType()}
			</div>
		)
	}
}

export default MapManager;

