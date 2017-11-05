import $ from 'jquery';
import React, { Component } from 'react';
import PubSub from 'pubsub-js'

import GeoMapManager from './GeoMapManager.js'
import InfoMapManager from './InfoMapManager.js'
import {
	MapTypeEnum,
	ACTIVE_PARAMS_CHANGE_EVENT,
	HOVER_NODE_EVENT,
	UNHOVER_NODE_EVENT,
	FOCUSED_NODE_CHANGE_EVENT,
	FOCUSED_TYPE_CHANGE_EVENT } from './ContentManager.js'

class MapManager extends Component {
	constructor(props) {
		super(props)
		this.contentManager_ = props.contentManager;

		this.currentManager_ = null;
		this.infoMapManager_ = null;
		this.geoMapManager_ = null;

		this.tokens_ = [];

		// this.tokens_.push(PubSub.subscribe(
		// 		ACTIVE_MAP_CHANGE_EVENT, this.handleActiveMapChange.bind(this)));
		this.tokens_.push(PubSub.subscribe(
				HOVER_NODE_EVENT, this.handleHoverNode.bind(this)));
		this.tokens_.push(PubSub.subscribe(
				UNHOVER_NODE_EVENT, this.handleUnhoverNode.bind(this)));
		this.tokens_.push(PubSub.subscribe(
				ACTIVE_PARAMS_CHANGE_EVENT, this.handleActiveParamsChange.bind(this)));
		this.tokens_.push(PubSub.subscribe(
				FOCUSED_NODE_CHANGE_EVENT, this.handleFocusedNodeChange.bind(this)));
		this.tokens_.push(PubSub.subscribe(
				FOCUSED_TYPE_CHANGE_EVENT, this.handleFocusedTypeChange.bind(this)));

		this.state = {
			activeMapType: this.contentManager_.getActiveMapType(),
			focusedNodeId: this.contentManager_.getActiveNodeId(),
			focusedTypeId: this.contentManager_.getActiveTypeId(),
			focusedStoryId: this.contentManager_.getActiveStoryId(),
			focusedFilterId: this.contentManager_.getActiveFilterType()
		};
	}

	componentDidMount() {
		this.updateCurrentManager();
	}

	componentDidUpdate() {
		this.updateCurrentManager();
		const focusedNodeId = this.contentManager_.getFocusedNodeId();
		if (focusedNodeId) {
			this.completeLoad().then(() => {
				this.currentManager_.setFocusedNode(focusedNodeId);
			});
		}
	}

	updateCurrentManager() {
		switch(this.state.activeMapType) {
			case MapTypeEnum.GEO:
				this.currentManager_ = this.geoMapManager_;
				break;
			case MapTypeEnum.INFO:
				this.currentManager_ = this.infoMapManager_;
				break;
			default:
				this.currentManager_ = null;
		}
	}

  expand(timeout) {
    $('.map_manager').animate({width: '50%'}, timeout);
  }

  contract(timeout) {
    $('.map_manager').animate({width: '0%'}, timeout);
  }

	handleHoverNode(e, data) {
		this.completeLoad().then(() => {
			this.currentManager_.handleHoverNode(data.nodeId, data.origin);
		});
	}

	handleUnhoverNode(e, data) {
		this.completeLoad().then(() => {
			this.currentManager_.handleUnhoverNode(data.nodeId, data.origin);
		});
	}

	handleActiveParamsChange(e, data) {
		this.completeLoad().then(() => {

			const mapTypeChanged = data.mapTypeChanged();
			if (mapTypeChanged) {
				this.handleActiveMapChange(this.contentManager_.getActiveMapType());
			}

			const activeStoryId = this.contentManager_.getActiveStoryId();
			if ((data.storyIdChanged() || mapTypeChanged) && activeStoryId) {
				this.currentManager_.handleActiveStoryChange(activeStoryId);
			}
			const activeFilterType = this.contentManager_.getActiveFilterType();
			if ((data.filterTypeChanged() || mapTypeChanged) && activeFilterType) {
				this.currentManager_.handleActiveFilterChange(activeFilterType);
			}

			const activeNodeId = this.contentManager_.getActiveNodeId()
			if ((data.nodeIdChanged() || mapTypeChanged) && activeNodeId) {
				this.currentManager_.handleActiveNodeChange(activeNodeId);
			}

			const activeTypeId = this.contentManager_.getActiveTypeId()
			if ((data.typeIdChanged() || mapTypeChanged) && activeTypeId) {
				this.currentManager_.handleActiveTypeChange(activeTypeId);
			}

			if (!this.contentManager_.hasActiveBreakdown()) {
				this.currentManager_.resetActives();
			}
		})
	}

	handleActiveMapChange(mapType) {
		this.setState({ activeMapType: mapType });
	}

	handleFocusedNodeChange(e, data) {
		this.completeLoad().then(() => {
			const nodeId = data.nodeId;
			if (!nodeId) {
				this.currentManager_.clearFocusedNode();
			} else {
				this.currentManager_.setFocusedNode(nodeId);
			}
		});
	}

	handleFocusedTypeChange(e, data) {

	}

	completeLoad() {
		return this.currentManager_.completeLoad();
	}

	render() {
		return (
			<div className="map_manager">
				<GeoMapManager
						contentManager = {this.contentManager_}
						visible = {this.state.activeMapType == MapTypeEnum.GEO}
						ref={(node) => { this.geoMapManager_ = node; }}/>
				<InfoMapManager
						contentManager = {this.contentManager_}
						visible = {this.state.activeMapType == MapTypeEnum.INFO}
						ref={(node) => { this.infoMapManager_ = node; }} />
			</div>
		)
	}
}

export default MapManager;

