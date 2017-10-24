import $ from 'jquery';
import React, { Component } from 'react';

class Node {
	constructor(nodeObject) {
		this.nodeId_ = nodeObject.nodeId;
		this.geoId_ = nodeObject.geoId;
		this.typeId_ = nodeObject.infoId;
		this.name_ = nodeObject.name;
	}

	getId() {
		return this.nodeId_;
	}

	getGeoId() {
		return this.geoId_;
	}

	getTypeId() {
		return this.typeId_;
	}

	getName() {
		return this.name_
	}
}

export default Node;
