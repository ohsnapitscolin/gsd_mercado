import React, { Component } from 'react';
import $ from 'jquery';
import PubSub from 'pubsub-js';

import Node from './Node.js';
import Type from './Type.js';
import StoryNode from './StoryNode.js';

export const ContentTypeEnum = {
	GRID : 0,
  MAP : 1
};

export const FilterTypeEnum = {
	NONE: 0,
	RED: 1,
	GREEN: 2,
	POPUPINFO: 3
};

export const GRID_TYPE_CHANGE_EVENT = "gridTypeChangeEvent";
export const MAP_TYPE_CHANGE_EVENT = "mapTypeChangeEvent";

export const FILTER_TYPE_CHANGE_EVENT = "filterTypeChangeEvent";

export const CLICK_NODE_EVENT = "clickNodeEvent";
export const CLICK_STORY_EVENT = "clickStoryEvent";
export const HOVER_NODE_EVENT = "hoverNodeEvent";
export const UNHOVER_NODE_EVENT = "unhoverNodeEVent";

export const ACTIVE_NODE_CHANGE_EVENT = "ACTIVE_NODE_CHANGE_EVENT";


class ContentManager {
	constructor() {
		this.nodeMap_ = new Map();

		this.geoToNodeMap_ = new Map();

		this.storyMap_ = new Map();
		this.nodeToStoriesMap_ = new Map();

		this.typeMap_ = new Map();
		this.typeToNodesMap_ = new Map();
	}

	loadNodes(nodesJson, storiesJson, typesJson) {
		for (let i = 0; i < typesJson.length; i++) {
      const typeObject = typesJson[i];
      const type = new Type(typeObject);
      this.typeMap_.set(type.getId(), type);
    }

		for (let i = 0; i < nodesJson.length; i++) {
			const nodeObject = nodesJson[i];
			const node = new Node(nodeObject);

			this.nodeMap_.set(node.getId(), node);
			this.geoToNodeMap_.set(node.getGeoId(), node);

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
			const storyNode = new StoryNode(storyObject);

			let nodes = [];
			for (let j = 0; j < storyObject.nodes.length; j++) {
				const nodeId = storyObject.nodes[j];
				const node = this.getNodes(nodeId)
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


		this.activeNodeId_ = -1;
	}

	// loadResource(resource) {
	// 	return require("../resources/" + resource);
	// }

	// loadGeojsonAsync(geojson) {
 //    return import("../resources/geojson/" + geojson);
	// }

	// loadNodeImageAsync(nodeId, imageName) {
	// 	return import("../resources/nodes/" + nodeId + "/images/" + imageName);
	// }

	getNodes() {
		return this.nodeMap_;
	}

	getStoryNode(storyId) {

	}

	getStoriesForNodeId(nodeId) {
		return this.nodeToStoriesMap_.get(nodeId);
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

	clickStory(storyId) {
		PubSub.publish(CLICK_STORY_EVENT, {
			storyId: storyId
		});
	}

	setActiveNode(nodeId) {
		if (nodeId == this.activeNodeId_) {
			return;
		}
		this.activeNodeId_ = nodeId;
		PubSub.publish(ACTIVE_NODE_CHANGE_EVENT, {
			nodeId: nodeId
		});
	}

	clickNode(nodeId, origin) {
		console.log(nodeId);
		PubSub.publish(CLICK_NODE_EVENT, {
			nodeId: nodeId,
			origin: origin
		});
		this.setActiveNode(nodeId);
	}

	hoverNode(nodeId, origin) {
		PubSub.publish(HOVER_NODE_EVENT, {
			nodeId: nodeId,
			origin: origin
		});
	}

	unhoverNode(nodeId, origin) {
		PubSub.publish(UNHOVER_NODE_EVENT, {
			nodeId: nodeId,
			origin: origin
		});
	}

	setFilterType(filterType) {
		console.log('setFilterType: ' + filterType);
		PubSub.publish(FILTER_TYPE_CHANGE_EVENT, filterType);
	}

	setGridType(gridType) {
		PubSub.publish(GRID_TYPE_CHANGE_EVENT, gridType);
	}

	setMapType(mapType) {
   	PubSub.publish(MAP_TYPE_CHANGE_EVENT, mapType);
	}
}

export default ContentManager;
