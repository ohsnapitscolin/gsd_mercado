import $ from 'jquery';
import React, { Component } from 'react';
import PubSub from 'pubsub-js'

import GeoMapManager from './GeoMapManager.js';
import InfoMapManager from './InfoMapManager.js';
import {
	GridTypeEnum,
	MapTypeEnum,
	ACTIVE_PARAMS_CHANGE_EVENT,
	HOVER_CHANGE_EVENT,
	FOCUS_CHANGE_EVENT,
	RENDERED_CHAPTER_CHANGE_EVENT } from './ContentManager.js';
import FilterManager from './FilterManager.js';

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
				HOVER_CHANGE_EVENT, this.handleHoverChange.bind(this)));
		this.tokens_.push(PubSub.subscribe(
				ACTIVE_PARAMS_CHANGE_EVENT, this.handleActiveParamsChange.bind(this)));
		this.tokens_.push(PubSub.subscribe(
				RENDERED_CHAPTER_CHANGE_EVENT,
				this.handleRenderedChapterChange.bind(this)));
		this.tokens_.push(PubSub.subscribe(
				FOCUS_CHANGE_EVENT, this.handleFocusChange.bind(this)));

		this.state = {
			activeMapType: this.contentManager_.getActiveMapType(),
		};
	}

	componentDidMount() {
		this.updateCurrentManager();
	}

	componentDidUpdate() {
		this.updateCurrentManager();
		this.updateFocus();
		// if (focusedTypeId) {
		// 	this.completeLoad().then(() => {
		// 		this.currentManager_.setFocusedTypeId(focusedTypeId);
		// 	});
		// }
		// if (focusedGeoId) {
		// 	this.completeLoad().then(() => {
		// 		this.currentManager_.setFocusedGeoId(focusedGeoId);
		// 	});
		// }
		const renderedChapters = this.contentManager_.getRenderedChapters();
		if (this.currentManager_ && renderedChapters.length) {
			this.completeLoad().then(() => {
				this.currentManager_.renderChapters(renderedChapters);
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

	showMap() {
		this.expand()
	}

	hideMap() {
		this.contract()
	}

  expand(timeout) {
    $('.map_manager').animate({width: '50%'}, timeout);
  }

  contract(timeout) {
    $('.map_manager').animate({width: '0%'}, timeout);
  }

  handleHoverChange(e, data) {
  	console.log("hover change!");
		if (!this.currentManager_) {
			return;
		}

		this.completeLoad().then(() => {
			if (data.isHovered) {
				this.currentManager_.handleHoverNode(
						data.geoId, data.typeId, data.flyTo, data.preview);
			} else {
				this.currentManager_.handleUnhoverNode(
						data.geoId, data.typeId, data.hideOnHover);
			}
		});
  }

	handleActiveParamsChange(e, data) {
		this.completeLoad().then(() => {
			const mapTypeChanged = data.mapTypeChanged();
			if (mapTypeChanged) {
				this.handleActiveMapChange(this.contentManager_.getActiveMapType());
			}

			if (!this.currentManager_) {
				return;
			}

			const activeStoryId = this.contentManager_.getActiveStoryId();
			if ((data.storyIdChanged() || mapTypeChanged) && activeStoryId) {
				// this.currentManager_.handleActiveStoryChange(activeStoryId);
				this.currentManager_.resetActives();
			}

			const activeCharacterId = this.contentManager_.getActiveCharacterId();
			if ((data.characterIdChanged() || mapTypeChanged) && activeCharacterId) {
				this.currentManager_.handleActiveCharacterChange(activeCharacterId);
			}

			const activeMaterialId = this.contentManager_.getActiveMaterialId();
			if ((data.materialIdChanged() || mapTypeChanged) && activeMaterialId) {
				this.currentManager_.handleActiveMaterialChange(activeMaterialId);
			}

			const activeNodeId = this.contentManager_.getActiveNodeId()
			if ((data.nodeIdChanged() || mapTypeChanged) && activeNodeId) {
				this.currentManager_.handleActiveNodeChange(activeNodeId);
			}

			const activeTypeId = this.contentManager_.getActiveTypeId()
			if ((data.typeIdChanged() || mapTypeChanged) && activeTypeId) {
				this.currentManager_.handleActiveTypeChange(activeTypeId);
			}

			const activeGridType = this.contentManager_.getActiveGridType();
			const activeFilterMap = this.contentManager_.getActiveFilterMap();
			if (data.filterTypeChanged() || data.gridTypeChanged() ||
					data.nodeIdChanged()) {
				if (activeGridType === GridTypeEnum.NODE &&
							!this.contentManager_.hasActiveBreakdown()) {
					this.currentManager_.showFilteredNodes(FilterManager.getFilteredNodes(
							this.contentManager_, activeFilterMap));
				} else if (!this.contentManager_.hasActiveBreakdown()) {
					this.currentManager_.resetActives();
				}
			}

			if(mapTypeChanged) {
				if (activeGridType === GridTypeEnum.NODE &&
							!this.contentManager_.hasActiveBreakdown()) {
					this.currentManager_.showFilteredNodes(FilterManager.getFilteredNodes(
							this.contentManager_, activeFilterMap));
				}
			}
		})
	}

	handleActiveMapChange(mapType) {
		this.setState({ activeMapType: mapType });
	}

	handleFocusChange(e, data) {
		this.updateFocus();
	}

	updateFocus() {
		if (!this.currentManager_) {
			return;
		}

		this.completeLoad().then(() => {
			if (this.contentManager_.getFocusedNodeId()) {
				this.currentManager_.setFocusedNode(
						this.contentManager_.getFocusedNodeId());
			} else {
				this.currentManager_.setFocus(
					this.contentManager_.getFocusedGeoId(),
					this.contentManager_.getFocusedTypeId());
			}
		});
	}

	handleRenderedChapterChange(e, data) {
		if (!this.currentManager_) {
			return;
		}

		const renderedChapters = data.renderedChapters
		this.completeLoad().then(() => {
			if (renderedChapters && renderedChapters.length) {
				this.currentManager_.renderChapters(renderedChapters);
			}
		});
	}

	completeLoad() {
		if (this.currentManager_) {
			return this.currentManager_.completeLoad().then(() => {
				this.contentManager_.maybeSetMapLoaded();
			});
		} else {
			return Promise.resolve();
		}
	}

	render() {
		return (
			<div className="map_manager">
				<GeoMapManager
						contentManager = {this.contentManager_}
						visible = {this.state.activeMapType === MapTypeEnum.GEO}
						ref={(node) => { this.geoMapManager_ = node; }}/>
				<InfoMapManager
						contentManager = {this.contentManager_}
						visible = {this.state.activeMapType === MapTypeEnum.INFO}
						ref={(node) => { this.infoMapManager_ = node; }} />
			</div>
		)
	}
}

export default MapManager;

