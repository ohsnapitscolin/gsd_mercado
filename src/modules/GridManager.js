import $ from 'jquery';
import React, { Component } from 'react';
import PubSub from 'pubsub-js';

import About from './About.js'
import SelectionManager from './SelectionManager.js'
import StoryManager from './StoryManager.js'

import { GRID_TYPE_CHANGE_EVENT, CLICK_NODE_EVENT } from './ContentManager.js'

export const GridTypeEnum = {
	SELECTION : 0,
  STORY : 1,
  ABOUT: 2
};


class GridManager extends Component {
	constructor(props) {
		super(props)
		this.contentManager_ = props.contentManager;
		this.currentManager_ = null;

		this.token_ = PubSub.subscribe(
				GRID_TYPE_CHANGE_EVENT, this.handleGridTypeChange.bind(this));
		this.token_ = PubSub.subscribe(
				CLICK_NODE_EVENT, this.handleStoryClicked.bind(this));

		this.state = {
			type: GridTypeEnum.SELECTION,
			expanded: false,
			nodeId: -1
		};
	}

	handleGridTypeChange(e, gridType, opt_storyId) {
		this.setState({
			type: gridType,
			nodeId: opt_storyId || -1
		});
	}

	handleStoryClicked(e, data) {
		this.setState({
			type: GridTypeEnum.STORY,
			nodeId: data.nodeId
		});
	}

	componentDidMount() {
		// this.expand(2000);
	}

	expand() {
		this.setState({ expanded: true });
		$('.grid_manager').animate({width: '100%'}, 500);
	}

	contract() {
		this.setState({ expanded: false });
		$('.grid_manager').animate({width: '50%'}, 500);
	}

	renderGridType() {
		switch(this.state.type) {
			case GridTypeEnum.SELECTION:
				return (
					<SelectionManager
							contentManager = {this.contentManager_}
							ref={(node) => { this.currentManager_ = node; }}/>
				);
			case GridTypeEnum.STORY:
				return (
					<StoryManager
							contentManager = {this.contentManager_}
							nodeId = {this.state.nodeId}
							ref={(node) => { this.currentManager_ = node; }} />
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
					this.contract()
					this.contentManager_.setGridType(GridTypeEnum.SELECTION);
				}}>
					Selection!
				</button>
				<button onClick = {() => {
					this.contract()
					this.contentManager_.setGridType(GridTypeEnum.STORY);
				}}>
					Story!
				</button>
				<button onClick = {() => {
					this.expand()
					this.contentManager_.setGridType(GridTypeEnum.ABOUT);
				}}>
					About!
				</button>
				{this.renderGridType()}
			</div>
		)
	}
}

export default GridManager;

