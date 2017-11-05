import React, { Component } from 'react';
import $ from 'jquery';
import PubSub from 'pubsub-js';

import ActiveParamChangeData from './ActiveParamChangeData.js';
import NodeData from './NodeData.js';
import TypeData from './TypeData.js';
import StoryData from './StoryData.js';

export const MapTypeEnum = {
	GEO: 'geo',
  INFO: 'info',
};

export const GridTypeEnum = {
	SELECTION: 'selection',
	NODE: 'node',
  TYPE: 'type',
  STORY: 'story',
  ABOUT: 'about'
};

export const FilterTypeEnum = {
	NONE: "none",
	RED: "red",
	GREEN: "green",
	POPUPINFO: "popupinfo"
};

export const ACTIVE_PARAMS_CHANGE_EVENT = "activeParamChangeEvent";

export const HOVER_NODE_EVENT = "hoverNodeEvent";
export const UNHOVER_NODE_EVENT = "unhoverNodeEvent";

export const FOCUSED_NODE_CHANGE_EVENT = "focusedNodeChangeEvent";
export const FOCUSED_TYPE_CHANGE_EVENT = "focusedTypeChangeEvent";
export const FOCUSED_STORY_CHANGE_EVENT = "focusedStoryChangeEvent";

const DEFAULT_MAP_TYPE = MapTypeEnum.GEO;
const DEFAULT_GRID_TYPE = GridTypeEnum.SELECTION;
const DEFAULT_FILTER_TYPE = FilterTypeEnum.NONE;


class ContentManager {
	constructor(nodesJson, storiesJson, typesJson, historyManager) {
		this.nodeMap_ = new Map();
		this.geoToNodeMap_ = new Map();
		this.storyMap_ = new Map();
		this.nodeToStoriesMap_ = new Map();
		this.typeMap_ = new Map();
		this.typeToNodesMap_ = new Map();

		this.loadNodes(nodesJson, storiesJson, typesJson);

		this.activeNodeId_ = null;
		this.activeTypeId_ = null;
		this.activeStoryId_ = null;
		this.activeFilterType_ = null;

		this.activeMapType_ = DEFAULT_MAP_TYPE;
		this.activeGridType_ = DEFAULT_GRID_TYPE;

		this.historyManager_ = historyManager;

		this.focusedNodeId_ = null;
		this.focusedTypeId_ = null;
		this.focusedStoryId_ = null;
	}

	loadNodes(nodesJson, storiesJson, typesJson) {
		for (let i = 0; i < typesJson.length; i++) {
      const typeObject = typesJson[i];
      const type = new TypeData(typeObject);
      this.typeMap_.set(type.getId(), type);
    }

		for (let i = 0; i < nodesJson.length; i++) {
			const nodeObject = nodesJson[i];
			const node = new NodeData(nodeObject);

			this.nodeMap_.set(node.getId(), node);
			this.geoToNodeMap_.set(node.getGeoId() + "", node);

			const typeId = node.getTypeId();
			let nodesArray = this.typeToNodesMap_.get(typeId);
			if (!nodesArray) {
				nodesArray = [];
			}
			nodesArray.push(node);
			this.typeToNodesMap_.set(typeId, nodesArray);
		}

		for (let i = 0; i < storiesJson.length; i++) {
			const storyObject = storiesJson[i];
			const storyNode = new StoryData(storyObject);

			let nodes = [];
			for (let j = 0; j < storyObject.nodes.length; j++) {
				const nodeId = storyObject.nodes[j];
				const node = this.getNode(nodeId)
				nodes.push(node);

				let storyNodesArray = this.nodeToStoriesMap_.get(nodeId);
				if (!storyNodesArray) {
					storyNodesArray = [];
				}
				storyNodesArray.push(storyNode);
				this.nodeToStoriesMap_.set(nodeId, storyNodesArray);
			}

			storyNode.setNodes(nodes);

			console.log(storyNode);
			const storyId = storyNode.getId();
			this.storyMap_.set(storyId, storyNode);
		}
	}

	getNodes() {
		return this.nodeMap_;
	}

	getStoryData(storyId) {
		return this.storyMap_.get(storyId) || null;
	}

	getTypesForStoryId(storyId) {
		let types = [];
		const storyData = this.getStoryData(storyId);
		if (storyData) {
			const nodes = storyData.getNodes();
			for (let i = 0; i < nodes.length; i++) {
				types.push(this.typeMap_.get(nodes[i].getTypeId()));
			}
		}
		return types;
	}

	getNodesForStoryId(storyId) {
		const storyData = this.getStoryData(storyId);
		return storyData ? storyData.getNodes() : [];
	}

	getStoriesForNodeId(nodeId) {
		return this.nodeToStoriesMap_.get(nodeId) || [];
	}

	getNodesForTypeId(typeId) {
		return this.typeToNodesMap_.get(typeId) || [];
	}

	getNode(nodeId) {
		return this.nodeMap_.get(nodeId);
	}

	getNodeByGeoId(geoId) {
		return this.geoToNodeMap_.get(geoId);
	}

	getType(typeId) {
		return this.typeMap_.get(typeId);
	}

	// Update actives

	updateActiveMapType(mapType) {
		this.historyManager_.setActiveMap(mapType);
	}

	updateActiveGridType(gridType) {
		this.historyManager_.setActiveGrid(gridType, true);
	}

	updateActiveNodeId(nodeId) {
		this.historyManager_.setActiveNode(nodeId, true);
	}

	updateActiveTypeId(typeId) {
		this.historyManager_.setActiveType(typeId, true);
	}

	updateActiveStoryId(storyId) {
		this.historyManager_.setActiveStory(storyId, true);
	}

	updateActiveFilterType(filterType) {
		this.historyManager_.setActiveFilter(filterType, true);
	}

	publishActiveParamChanges() {
		const activeMapType = this.getMapTypeFromParams();
		const activeMapTypeChanged = this.activeMapType_ != activeMapType;
		this.activeMapType_ = activeMapType;

		const activeGridType = this.getGridTypeFromParams();
		const activeGridTypeChanged = this.activeGridType_ != activeGridType;
		this.activeGridType_ = activeGridType;

		const activeNodeId = this.getNodeIdFromParams();
		const activeNodeIdChanged = this.activeNodeId_ != activeNodeId;
		this.activeNodeId_ = activeNodeId;

		const activeTypeId = this.getTypeIdFromParams();
		const activeTypeIdChanged = this.activeTypeId_ != activeTypeId;
		this.activeTypeId_ = activeTypeId;

		const activeStoryId = this.getStoryIdFromParams();
		const activeStoryIdChanged = this.activeStoryId_ != activeStoryId;
		this.activeStoryId_ = activeStoryId;

		const activeFilterType = this.getFilterTypeFromParams();
		const activeFilterTypeChanged = this.activeFilterType_ != activeFilterType;
		this.activeFilterType_ = activeFilterType;

		PubSub.publish(ACTIVE_PARAMS_CHANGE_EVENT, new ActiveParamChangeData(
				activeMapTypeChanged,
				activeGridTypeChanged,
				activeNodeIdChanged,
				activeTypeIdChanged,
				activeStoryIdChanged,
				activeFilterTypeChanged));
	}

	hoverNode(nodeId) {
		PubSub.publish(HOVER_NODE_EVENT, {
			nodeId: nodeId
		});
	}

	unhoverNode(nodeId) {
		PubSub.publish(UNHOVER_NODE_EVENT, {
			nodeId: nodeId
		});
	}

	setFocusedNodeId(nodeId) {
		if (this.focusedNodeId_ != nodeId) {
			this.focusedNodeId_ = nodeId;
			PubSub.publish(FOCUSED_NODE_CHANGE_EVENT, {
				nodeId: nodeId
			});
		}
	}

	getFocusedNodeId() {
		return this.focusedNodeId_;
	}

	setFocusedTypeId(typeId) {
		if (this.focusedTypeId_ != typeId) {
			this.focusedTypeId_ = typeId;
			PubSub.publish(FOCUSED_TYPE_CHANGE_EVENT, {
				typeId: typeId
			});
		}
	}

	setFocusedStoryId(storyId) {
		if (this.focusedStoryId_ != storyId) {
			this.focusedStoryId_ = storyId;
			PubSub.publish(FOCUSED_STORY_CHANGE_EVENT, {
				storyId: storyId
			});
		}
	}

	// Active params

	getActiveGridType() {
		return this.activeGridType_;
	}

	getActiveMapType() {
		return this.activeMapType_;
	}

	getActiveNodeId() {
		return this.activeNodeId_;
	}

	getActiveTypeId() {
		return this.activeTypeId_;
	}

	getActiveStoryId() {
		return this.activeStoryId_;
	}

	getActiveFilterType() {
		return this.activeFilterType_;
	}

	hasActiveBreakdown() {
		return this.activeNodeId_ ||
				this.activeTypeId_ ||
				this.activeStoryId_ ||
				this.activeFilterType_;
	}

	// Handle history

	getMapTypeFromParams() {
		const activeMapType = this.historyManager_.getActiveMap();
		const isValidMapType =
				Object.values(MapTypeEnum).indexOf(activeMapType) > -1;
		return isValidMapType ? activeMapType : DEFAULT_MAP_TYPE;
	}

	getGridTypeFromParams() {
		const activeGridType = this.historyManager_.getActiveGrid();
		const isValidGridType =
				Object.values(GridTypeEnum).indexOf(activeGridType) > -1;
		return isValidGridType ? activeGridType : DEFAULT_GRID_TYPE;
	}

	getNodeIdFromParams() {
		const activeNodeId = this.historyManager_.getActiveNode();
		const node = this.nodeMap_.get(activeNodeId);
		return node ? activeNodeId : null;
	}

	getStoryIdFromParams() {
		const activeStoryId = this.historyManager_.getActiveStory();
		console.log(activeStoryId);
		const story = this.storyMap_.get(activeStoryId);
		return story ? activeStoryId : null;
	}

	getTypeIdFromParams() {
		const activeTypeId = this.historyManager_.getActiveType();
		const type = this.typeMap_.get(activeTypeId);
		return type ? activeTypeId : null;
	}

	getFilterTypeFromParams() {
		const activeFilterType = this.historyManager_.getActiveFilter();
		const isValidFilterType =
				Object.values(FilterTypeEnum).indexOf(activeFilterType) > -1;

		const defaultFilterType =
				this.historyManager_.getActiveGrid() == GridTypeEnum.SELECTION ?
						DEFAULT_FILTER_TYPE : null;

		return isValidFilterType ? activeFilterType : defaultFilterType;
	}
}

export default ContentManager;
