import $ from 'jquery';
import React, { Component } from 'react';
import PubSub from 'pubsub-js';

import About from './About.js'
import SelectionManager from './SelectionManager.js'
import Story from './Story.js'
import Type from './Type.js'
import Node from './Node.js'

import { GridTypeEnum, ACTIVE_PARAMS_CHANGE_EVENT } from './ContentManager.js'

const DEFAULT_GRID_TYPE = GridTypeEnum.SELECTION;

class GridManager extends Component {
	constructor(props) {
		super(props)
		this.contentManager_ = props.contentManager;

		this.tokens_ = [];
		this.tokens_.push(PubSub.subscribe(
				ACTIVE_PARAMS_CHANGE_EVENT, this.handleActiveParamsChange.bind(this)));
		// this.tokens_.push(PubSub.subscribe(
		// 		ACTIVE_NODE_CHANGE_EVENT, this.handleActiveNodeChange.bind(this)));
		// this.tokens_.push(PubSub.subscribe(
		// 		ACTIVE_TYPE_CHANGE_EVENT, this.handleActiveTypeChange.bind(this)));
		// this.tokens_.push(PubSub.subscribe(
		// 		ACTIVE_STORY_CHANGE_EVENT, this.handleActiveStoryChange.bind(this)));
		// this.tokens_.push(PubSub.subscribe(
		// 		ACTIVE_FILTER_CHANGE_EVENT, this.handleActiveFilterChange.bind(this)));

		// if (activeNodeId) {
		// 	gridType = GridTypeEnum.NODE;
		// 	nodeId = activeNodeId;
		// } else if (activeTypeId) {
		// 	gridType = GridTypeEnum.TYPE
		// 	typeId = activeTypeId;
		// } else if (activeStoryId) {
		// 	gridType = GridTypeEnum.STORY;

		// 	// TODO(colin): Add support for all story ids.
		// 	// storyId = activeStoryId;
		// 	storyId = 6;
		// }

		this.state = {
			type: DEFAULT_GRID_TYPE,
			nodeId: null,
			typeId: null,
			storyId: null,
			filterType: null
		};
	}

	handleActiveParamsChange(e, data) {
		this.setState({
			type: this.contentManager_.getActiveGridType(),
			nodeId: this.contentManager_.getActiveNodeId(),
			typeId: this.contentManager_.getActiveTypeId(),
			storyId: this.contentManager_.getActiveStoryId() ? 6 : null,
			// storyId: this.contentManager_.getActiveStoryId(),
			filterType: this.contentManager_.getActiveFilterType()
		});
	}

	handleActiveTypeChange(e, data) {
		if (!data.typeId) {
			return;
		}

		this.setState({
			type: GridTypeEnum.TYPE,
			nodeId: data.typeId,
			typeId: null,
			storyId: null,
			filterType: null
		});
	}

	handleActiveStoryChange(e, data) {
		if (!data.storyId) {
			return;
		}

		this.setState({
			type: GridTypeEnum.STORY,
			nodeId: null,
			typeId: null,
			storyId: 6,
			filterType: null
			// TODO(colin): Add support for all story ids.
			// storyId: data.storyId
		});
	}

	handleActiveFilterChange(e, data) {
		if (!data.filterType) {
			return;
		}

		this.setState({
			type: GridTypeEnum.SELECTION,
			nodeId: null,
			typeId: null,
			storyId: null,
			filterType: data.filterType
		});
	}

	expand() {
		this.setState({ expanded: true });
		$('.grid_manager').animate({width: '100%'}, 500);
	}

	contract() {
		this.setState({ expanded: false });
		$('.grid_manager').animate({width: '50%'}, 500);
	}

	renderBackButton() {
		return (
			<button onClick={() => {
				this.contentManager_.updateActiveGridType(GridTypeEnum.SELECTION);
			}}>
				Back
			</button>
		);
	}

	renderGridType() {
		console.log('renderGridType: ' + this.state);
		switch(this.state.type) {
			case GridTypeEnum.SELECTION:
				return (
					<SelectionManager
							contentManager = {this.contentManager_}
							filterType = { this.state.filterType }/>
				);
			case GridTypeEnum.NODE:
				return (
					<div className="grid_node">
						{this.renderBackButton()}
						<Node
								contentManager = {this.contentManager_}
								nodeId = {this.state.nodeId} />
					</div>
				);
			case GridTypeEnum.TYPE:
				return (
					<div className="grid_type">
						{this.renderBackButton()}
						<Type
								contentManager = {this.contentManager_}
								typeId = {this.state.typeId} />
					</div>
				);
			case GridTypeEnum.STORY:
				return (
					<div className="grid_story">
						{this.renderBackButton()}
						<Story
								contentManager = {this.contentManager_}
								storyId = {this.state.storyId} />
					</div>
				);
			case GridTypeEnum.ABOUT:
				return (
					<About
							contentManager = {this.contentManager_}
							ref={null} />
				);
		}
		return (
			<div>Unknown GridManager</div>
		);
	}

	render() {
		return (
			<div className="grid_manager">
				<button onClick = {() => {
					this.state.expanded ? this.contract() : this.expand();
				}}>
					{this.state.expanded ? 'Contract' : 'Expand'}
				</button>
				<button onClick = {() => {
					this.expand()
					this.contentManager_.updateActiveGridType(GridTypeEnum.ABOUT);
				}}>
					About!
				</button>
				{this.renderGridType()}
			</div>
		)
	}
}

export default GridManager;

