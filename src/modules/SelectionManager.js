import $ from 'jquery';
import React, { Component } from 'react';
import PubSub from 'pubsub-js';

import NodeSelectionManager from './NodeSelectionManager.js';

import {
	GridTypeEnum,
	FilterTypeEnum,
	HOVER_CHANGE_EVENT } from './ContentManager';
// import Selection from './Selection.js'


class SelectionManager extends Component {
	constructor(props) {
		super(props)
		this.contentManager_ = props.contentManager;

		this.tokens_ = [];
		// this.tokens_.push(PubSub.subscribe(
		// 		HOVER_NODE_EVENT, this.handleHoverNode.bind(this)));
		// this.tokens_.push(PubSub.subscribe(
		// 		UNHOVER_NODE_EVENT, this.handleUnhoverNode.bind(this)));
	}

	componentDidMount() {
		// this.updateHovers();
	}

	componentDidUpdate() {
		// this.updateHovers();
	}

  updateHovers() {
  	if (this.props.selectionType != GridTypeEnum.NODE) {
  		return;
  	}

    const thisSelectionManager = this;
    $('.selection_node').each(function() {
    	const nodeId = $(this).attr('id').split('-')[1];
    	$(this).unbind('mouseenter').mouseenter(() => {
    		thisSelectionManager.contentManager_.hoverNodeId(nodeId, true);
    	})
    	$(this).unbind('mouseleave').mouseleave(() => {
    		thisSelectionManager.contentManager_.unhoverNodeId(nodeId, false);
    	});
    });
  }

  handleHoverNode(e, data) {
		const $selectionItem = $('#selection_' + data.nodeId);
		$selectionItem.addClass('hovered');
  }

  handleUnhoverNode(e, data) {
		const $selectionItem = $('#selection_' + data.nodeId);
		$selectionItem.removeClass('hovered');
  }

	handleFilterTypeChange(e, data) {
	}

	applyFilter(nodes) {
		if (this.props.filterType == FilterTypeEnum.NONE) {
			return nodes;
		}

		let updatedNodes = [];
		nodes.forEach((node) => {
			if(this.props.filterType == FilterTypeEnum.POPUPINFO) {
				if (node.PopupInfo != null) {
					updatedNodes.push(node);
				}
			}
		});
		return updatedNodes;
	}

	renderFilters() {
		return (
			<div id="filters">
				<button
	 		 			type="button"
	 		 			onClick={() => {
	 		 				this.contentManager_.updateActiveFilterType(
	 		 						FilterTypeEnum.NONE);
	 		 			}}>
		 			None!
	 			</button>
				<button
	 		 			type="button"
	 		 			onClick={() => {
	 		 				this.contentManager_.updateActiveFilterType(
	 		 						FilterTypeEnum.RED);
	 		 			}}>
		 			Red!
	 			</button>
	 			<button
	 		 			type="button"
	 		 			onClick={() => {
	 		 				this.contentManager_.updateActiveFilterType(
	 		 						FilterTypeEnum.GREEN);
	 		 			}}>
		 			Green!
	 			</button>
	 			<button
	 		 			type="button"
	 		 			onClick={() => {
	 		 				this.contentManager_.updateActiveFilterType(
 		 							FilterTypeEnum.POPUPINFO);
	 		 			}}>
		 			PopupInfo!
	 			</button>
	 			<div>
	 				{this.props.filterType}
	 			</div>
			</div>
		)
	}

	renderSelection() {
		let grid = [];
		let selection = [];
		let clickFn = null;
		let className = "selection_node";
		switch(this.props.selectionType) {
			case GridTypeEnum.NODE:
				selection = this.contentManager_.getNodes();
				clickFn = this.contentManager_.updateActiveNodeId;
				className = "selection_node"
				break;
			case GridTypeEnum.CHARACTER:
				selection = this.contentManager_.getCharacters();
				clickFn = this.contentManager_.updateActiveCharacterId;
				className = "selection_character"
				break;
			case GridTypeEnum.MATERIAL:
				selection = this.contentManager_.getMaterials();
				clickFn = this.contentManager_.updateActiveMaterialId;
				className = "selection_material"
				break;
			case GridTypeEnum.TYPE:
				selection = this.contentManager_.getTypes();
				clickFn = this.contentManager_.updateActiveTypeId;
				className = "selection_type"
				break;
			case GridTypeEnum.STORY:
				selection = this.contentManager_.getStories();
				clickFn = this.contentManager_.updateActiveStoryId;
				className = "selection_story"
				break;
		}

		selection.forEach((selection) => {
			const selectionId = selection.getId();
			grid.push(
        <div
        		key={selectionId}
        		className={`selection ${className}`}
        		id={'selection-' + selectionId}
        		onClick={clickFn.bind(this.contentManager_, selectionId)}>
        	<div className="selection_image_container">
	        	<img
	        		className="selection_image"
	        		src={require("../resources/test_image1.jpg")}/>
      		</div>
        	{selection.getId()}
        </div>
      );
		});

		return (
			<div>
				{grid}
			</div>
		);
	}

	render() {
		if (this.props.selectionType == GridTypeEnum.NODE) {
			return (
				<div>
					<NodeSelectionManager
							contentManager = {this.contentManager_}
							filterData = {this.props.filterType} />
				</div>
			);
		} else {
			return (
				<div>
					{this.renderSelection()}
				</div>
			);
		}
	}
}

export default SelectionManager;

