import $ from 'jquery';
import React, { Component } from 'react';

class StoryNode {
	constructor(storyObject) {
		this.storyId_ = storyObject.storyId;
		this.name_ = storyObject.name;
		this.nodes_ = [];
	}

	setNodes(nodes) {
		this.nodes_ = nodes;
	}

	getNodes() {
		return this.nodes_;
	}

	getId() {
		return this.storyId_;
	}

	getName() {
		return this.name_;
	}
}

export default StoryNode;
