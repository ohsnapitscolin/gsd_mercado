import $ from 'jquery';
import React, { Component } from 'react';
import PubSub from 'pubsub-js';

import About from './About.js';
import SelectionManager from './SelectionManager.js';
import Story from './Story.js'
import Type from './Type.js';
import Node from './Node.js';
import Character from './Character.js';
import Material from './Material.js';

import { GridTypeEnum, MapTypeEnum,
		ACTIVE_PARAMS_CHANGE_EVENT } from './ContentManager.js'

const DEFAULT_GRID_TYPE = GridTypeEnum.NODE;

class GridManager extends Component {
	constructor(props) {
		super(props)
		this.contentManager_ = props.contentManager;

		this.tokens_ = [];
		this.tokens_.push(PubSub.subscribe(
				ACTIVE_PARAMS_CHANGE_EVENT, this.handleActiveParamsChange.bind(this)));

		this.state = {
			gridType: DEFAULT_GRID_TYPE,
			nodeId: null,
			characterId: null,
			materialId: null,
			typeId: null,
			storyId: null,
			filterMap: new Map()
		};

		this.recentGridType_ = DEFAULT_GRID_TYPE;
		this.expanded_ = false;
	}

	handleActiveParamsChange(e, data) {
		this.setState({
			gridType: this.contentManager_.getActiveGridType(),
			nodeId: this.contentManager_.getActiveNodeId(),
			characterId: this.contentManager_.getActiveCharacterId(),
			materialId: this.contentManager_.getActiveMaterialId(),
			typeId: this.contentManager_.getActiveTypeId(),
			storyId: this.contentManager_.getActiveStoryId() ? 'test_story_1' : null,
			// storyId: this.contentManager_.getActiveStoryId(),
			filterMap: this.contentManager_.getActiveFilterMap()
		});

		if (data.mapTypeChanged()) {
			this.style();
		}
	}

	componentDidMount() {
		this.style();
	}

	style() {
		if(this.contentManager_.getActiveMapType() === MapTypeEnum.NONE) {
			this.expand();
			this.expanded_ = true;
		} else {
			this.contract();
			this.expanded_ = false;
		}
	}

	expand() {
		if (this.expanded_) {
			this.contentManager_.maybeSetGridLoaded();
			return;
		}
		// $('.grid_content').css({visibility: 'hidden'});
		$('.grid_manager').animate({width: '100%'}, 150, () => {
			// $('.grid_content').css({visibility: 'visible'});
			this.contentManager_.maybeSetGridLoaded();
		});
	}

	contract() {
		if (!this.expanded_) {
			this.contentManager_.maybeSetGridLoaded();
			return;
		}
		// $('.grid_content').css({'visibility': 'hidden'});
		$('.grid_manager').animate({width: '50%'}, 150, () => {
			// $('.grid_content').css({'visibility': 'visible'});
			this.contentManager_.maybeSetGridLoaded();
		});
	}

	renderBackButton() {
		return (
			<button onClick={() => {
				this.contentManager_.updateActiveGridType(this.recentGridType_);
			}}>
				Back
			</button>
		);
	}

	renderGridType() {
		if (this.state.gridType === GridTypeEnum.ABOUT) {
			return (
				<About
						contentManager = {this.contentManager_}
						ref={null} />
			);
		} else if (!this.contentManager_.hasActiveBreakdown()) {
			this.recentGridType_ = this.state.gridType;
			return (
				<SelectionManager
						contentManager = {this.contentManager_}
						selectionType = {this.state.gridType}
						filterMap = {this.state.filterMap} />
			);
		}

		switch(this.state.gridType) {
			case GridTypeEnum.NODE:
				return (
					<div className="grid_node">
						<Node
								contentManager = {this.contentManager_}
								nodeId = {this.state.nodeId} />
					</div>
				);
			case GridTypeEnum.CHARACTER:
				return (
					<div className="grid_character">
						<Character
								contentManager = {this.contentManager_}
								characterId = {this.state.characterId} />
					</div>
				);
			case GridTypeEnum.MATERIAL:
				return (
					<div className="grid_material">
						<Material
								contentManager = {this.contentManager_}
								materialId = {this.state.materialId} />
					</div>
				);
			case GridTypeEnum.TYPE:
				return (
					<div className="grid_type">
						<Type
								contentManager = {this.contentManager_}
								typeId = {this.state.typeId} />
					</div>
				);
			case GridTypeEnum.STORY:
				return (
					<div className="grid_story">
						<Story
								contentManager = {this.contentManager_}
								storyId = {this.state.storyId} />
					</div>
				);
			default:
				return (
					<div>Unknown GridManager</div>
				);
			}
	}

	render() {
		return (
			<div
					className="grid_manager"
					id={"grid_manager_" + this.state.gridType}>
				<div
						className="grid_header grid_header_story"
						onClick = {() => {
					this.contentManager_.updateActiveGridType(GridTypeEnum.STORY);
				}}>
					<div className="grid_header_content">
						Stories
					</div>
				</div>
				<div
						className="grid_header grid_header_character"
						onClick = {() => {
					this.contentManager_.updateActiveGridType(GridTypeEnum.CHARACTER);
				}}>
					<div className="grid_header_content">
						Characters
					</div>
				</div>
				<div
						className="grid_header grid_header_material"
						onClick = {() => {
					this.contentManager_.updateActiveGridType(GridTypeEnum.MATERIAL);
				}}>
					<div className="grid_header_content">
						Materials
					</div>
				</div>
				<div
						className="grid_header grid_header_node"
						onClick = {() => {
					this.contentManager_.updateActiveGridType(GridTypeEnum.NODE);
				}}>
					<div className="grid_header_content">
						Places
					</div>
				</div>
				<div
						className="grid_header grid_header_about"
						onClick = {() => {
					this.contentManager_.updateActiveGridType(GridTypeEnum.ABOUT);
				}}>
					<div className="grid_header_content">
						About
					</div>
				</div>
				<div className="grid_content">
					{this.renderGridType()}
				</div>
			</div>
		)
	}
}

export default GridManager;

