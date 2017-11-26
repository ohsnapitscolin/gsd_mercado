import $ from 'jquery';
import React, { Component } from 'react';
import PubSub from 'pubsub-js';

import {
	GridTypeEnum,
	FilterTypeEnum,
	ACTIVE_PARAMS_CHANGE_EVENT,
	HOVER_CHANGE_EVENT } from './ContentManager';

import FilterData from './FilterData.js'


class NodeSelectionManager extends Component {
	constructor(props) {
		super(props)
		this.contentManager_ = props.contentManager;

		this.tokens_ = [];
		// this.tokens_.push(PubSub.subscribe(
		// 		HOVER_NODE_EVENT, this.handleHoverNode.bind(this)));
		// this.tokens_.push(PubSub.subscribe(
		// 		ACTIVE_PARAMS_CHANGE_EVENT, this.handleActiveParamsChange.bind(this)));
	}

	componentDidMount() {
		this.updateHovers();
	}

	componentDidUpdate() {
		this.updateHovers();
	}

  updateHovers() {
    const thisNodeSelectionManager = this;
    $('.selection_node').each(function() {
    	const nodeId = $(this).attr('id').split('-')[1];
    	$(this).unbind('mouseenter').mouseenter(() => {
    		thisNodeSelectionManager.contentManager_.hoverNodeId(
	    			nodeId, true /* flyToNode */);
    	})
    	$(this).unbind('mouseleave').mouseleave(() => {
    		thisNodeSelectionManager.contentManager_.unhoverNodeId(
	    			nodeId, false /* hideOnHover */);
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

	handleActiveParamsChange(e, data) {
		// this.setState({
		// 	filterType:
		// })
	}

	renderFilters() {
		return (
			<div id="filters">
				<button
	 		 			type="button"
	 		 			onClick={() => {
	 		 				this.contentManager_.updateActiveFilterType(
	 		 						new FilterData(FilterTypeEnum.NONE));
	 		 			}}>
		 			None!
	 			</button>
				<button
	 		 			type="button"
	 		 			onClick={() => {
	 		 				this.contentManager_.updateActiveFilterType(
	 		 						new FilterData(FilterTypeEnum.MATERIAL, "test_material_2"));
	 		 			}}>
		 			Material
	 			</button>
	 			<button
	 		 			type="button"
	 		 			onClick={() => {
	 		 				this.contentManager_.updateActiveFilterType(
	 		 						new FilterData(FilterTypeEnum.TYPE, "individual"));
	 		 			}}>
		 			Type
	 			</button>
	 			<button
	 		 			type="button"
	 		 			onClick={() => {
	 		 				this.contentManager_.updateActiveFilterType(
	 		 						new FilterData(FilterTypeEnum.SEPARATION, 3));
	 		 			}}>
		 			Separation
	 			</button>
	 			<button
	 		 			type="button"
	 		 			onClick={() => {
	 		 				this.contentManager_.updateActiveFilterType(
	 		 						new FilterData(FilterTypeEnum.CHARACTERS, 2));
	 		 			}}>
		 			Character
	 			</button>
	 			<div>
	 				{this.props.filterType}
	 			</div>
			</div>
		)
	}

	renderSelection() {
		let grid = [];
		let nodes = this.contentManager_.getFilteredNodes(this.props.filterData);

		nodes.forEach((nodeData) => {
			const nodeId = nodeData.getId();
			grid.push(
        <div
        		key = {nodeId}
        		className={"selection selection_node"}
        		id = {'selection-' + nodeId}
        		onClick = {() => { this.contentManager_.updateActiveNodeId(); }}>
        	<div className="selection_image_container">
	        	<img
	        		className="selection_image"
	        		src={require("../resources/test_image1.jpg")}/>
      		</div>
        	{nodeData.getName()}
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
		return (
			<div>
				{this.renderFilters()}
				{this.renderSelection()}
			</div>
		);
	}
}

export default NodeSelectionManager;

