import $ from 'jquery';
import React, { Component } from 'react';
import PubSub from 'pubsub-js';

import {
	ContentTypeEnum,
	FilterTypeEnum,
	FILTER_TYPE_CHANGE_EVENT,
	HOVER_NODE_EVENT,
	UNHOVER_NODE_EVENT } from './ContentManager';
// import Selection from './Selection.js'


class SelectionManager extends Component {
	constructor(props) {
		super(props)
		this.contentManager_ = props.contentManager;

		this.state = {
			filterType: FilterTypeEnum.NONE
		}

		this.tokens_ = [];
		this.tokens_.push(PubSub.subscribe(
				FILTER_TYPE_CHANGE_EVENT, this.handleFilterTypeChange.bind(this)));
		this.tokens_.push(PubSub.subscribe(
				HOVER_NODE_EVENT, this.handleHoverNode.bind(this)));
		this.tokens_.push(PubSub.subscribe(
				UNHOVER_NODE_EVENT, this.handleUnhoverNode.bind(this)));
	}

	componentDidMount() {
		this.updateHovers();
	}

	componentDidUpdate() {
		this.updateHovers();
	}

  updateHovers() {
    const thisSelectionManager = this;
    $('.selection_node').each(function() {
    	const nodeId = $(this).attr('id').split('_')[1];
    	$(this).hover(() => {
    		thisSelectionManager.contentManager_.hoverNode(
	    			nodeId, ContentTypeEnum.GRID);
    	}, () => {
    		thisSelectionManager.contentManager_.unhoverNode(
	    			nodeId, ContentTypeEnum.GRID);
    	});
    });
  }

  handleHoverNode(e, data) {
		const $selectionItem = $('#selection_' + data.nodeId);
		$selectionItem.addClass('hovered');
  }

  handleUnhoverNode(e, data) {
  	console.log('unhovered');
		const $selectionItem = $('#selection_' + data.nodeId);
		$selectionItem.removeClass('hovered');
  }

	handleFilterTypeChange(e, filterType) {
		this.setState({ filterType: filterType });
	}

	applyFilter(nodes) {
		if (this.state.filterType == FilterTypeEnum.NONE) {
			return nodes;
		}

		let updatedNodes = [];
		nodes.forEach((node) => {
			if(this.state.filterType == FilterTypeEnum.POPUPINFO) {
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
	 		 				this.contentManager_.setFilterType(FilterTypeEnum.NONE);
	 		 			}}>
		 			None!
	 			</button>
				<button
	 		 			type="button"
	 		 			onClick={() => {
	 		 				this.contentManager_.setFilterType(FilterTypeEnum.RED);
	 		 			}}>
		 			Red!
	 			</button>
	 			<button
	 		 			type="button"
	 		 			onClick={() => {
	 		 				this.contentManager_.setFilterType(FilterTypeEnum.GREEN);
	 		 			}}>
		 			Green!
	 			</button>
	 			<button
	 		 			type="button"
	 		 			onClick={() => {
	 		 				this.contentManager_.setFilterType(FilterTypeEnum.POPUPINFO);
	 		 			}}>
		 			PopupInfo!
	 			</button>
	 			<div>
	 				{this.state.filterType}
	 			</div>
			</div>
		)
	}

	renderSelection() {
		let grid = [];
		const nodes = this.applyFilter(this.contentManager_.getNodes());
		nodes.forEach((node) => {
			const nodeId = node.getId()
			grid.push(
        <div
        		key={nodeId}
        		className="selection_node"
        		id={'selection_' + nodeId}
        		onClick={() => {
        			this.contentManager_.clickNode(nodeId, ContentTypeEnum.GRID);
        		}}>
        	{node.getName()}
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
				SelectionManager
				{this.renderFilters()}
				{this.renderSelection()}
			</div>
		);
	}
}

export default SelectionManager;

