import $ from 'jquery';
import React, { Component } from 'react';

class Type {
	constructor(typeObject) {
		this.id_ = typeObject.id;
		this.category_ = typeObject.category;
	}

	getId() {
		return this.id_;
	}

	getCategory() {
		return this.category_;
	}
}

export default Type;
