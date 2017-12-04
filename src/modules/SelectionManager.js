import React, { Component } from 'react';

import CharacterSelectionManager from './CharacterSelectionManager.js';
import MaterialSelectionManager from './MaterialSelectionManager.js';
import NodeSelectionManager from './NodeSelectionManager.js';
import StorySelectionManager from './StorySelectionManager.js';

import { GridTypeEnum, ResourceStateEnum } from './ContentManager.js';

class SelectionManager extends Component {
	constructor(props) {
		super(props)
		this.contentManager_ = props.contentManager;

		this.state = {
			resourceState: ResourceStateEnum.LOADING
		}

		this.imageMap_ = new Map();
		this.loadResources().then(() => {
			this.setState({
				resourceState: ResourceStateEnum.LOADED
			});
		});
	}

	loadResources() {
		let resourcePromises = [];
		const dataIds = this.contentManager_.getDataIds();
		for (let i = 0; i < dataIds.length; i++) {
			resourcePromises.push(this.importThumbnail(dataIds[i]));
		}
		return Promise.all(resourcePromises);
	}

	importThumbnail(imageName) {
		return import(`../resources/images/thumbnails/${imageName}.jpg`)
				.then((image) => {
					this.imageMap_.set(imageName, image);
				}, (e) => {
					this.imageMap_.set(imageName, null);
				});
	}

	render() {
		switch (this.props.selectionType) {
			case GridTypeEnum.STORY:
				return (
					<StorySelectionManager
							contentManager = {this.contentManager_}
							filterMap = {this.props.filterMap}
							imageMap = {this.imageMap_} />
				);
			case GridTypeEnum.CHARACTER:
				return (
					<CharacterSelectionManager
							contentManager = {this.contentManager_}
							filterMap = {this.props.filterMap}
							imageMap = {this.imageMap_} />
				);
			case GridTypeEnum.MATERIAL:
				return (
					<MaterialSelectionManager
							contentManager = {this.contentManager_}
							filterMap = {this.props.filterMap}
							imageMap = {this.imageMap_} />
					);
			case GridTypeEnum.NODE:
				return (
					<NodeSelectionManager
							contentManager = {this.contentManager_}
							filterMap = {this.props.filterMap}
							imageMap = {this.imageMap_} />
				);
			default:
				return (<div/>);
		}
	}
}

export default SelectionManager;

