import $ from 'jquery';
import React, { Component } from 'react';

import FilterManager, { FilterParamEnum } from './FilterManager.js';


class NodeSelectionManager extends Component {
	constructor(props) {
		super(props)
		this.contentManager_ = props.contentManager;
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

	renderFilters() {
		return (
			<div id="filters">
	 			{FilterManager.renderMaterialFilter(this.contentManager_,
	 				this.props.filterMap, "node", (materialId) => {
	 		 				this.contentManager_.setActiveFilter(
	 		 						FilterParamEnum.MATERIAL, materialId);
		 				})}
	 			{FilterManager.renderTypeFilter(
		 				this.contentManager_, this.props.filterMap, "node", (typeId) => {
	 		 				this.contentManager_.setActiveFilter(
	 		 						FilterParamEnum.TYPE, typeId);
		 				})}
	 			{FilterManager.renderCharacterFilter(
	 				this.contentManager_, this.props.filterMap, "node", (characterId) => {
			 				this.contentManager_.setActiveFilter(
			 						FilterParamEnum.CHARACTER, characterId);
	 				})}
	 			<button
	 		 			type="button"
	 		 			onClick={() => {
	 		 				this.contentManager_.setActiveFilter(
	 		 						FilterParamEnum.SEPARATION, 3);
	 		 			}}>
		 			Separation
	 			</button>
			</div>
		)
	}

	renderSelection() {
		let grid = [];
		let nodes = FilterManager.getFilteredNodes(
				this.contentManager_, this.props.filterMap);

		nodes.forEach((nodeData) => {
			const nodeId = nodeData.getId();
			grid.push(
        <div
        		key={nodeId}
        		className={"selection selection_node"}
        		id={'selection-' + nodeId}
        		onClick={() => {
        				this.contentManager_.updateActiveNodeId(nodeId); }}>
        	<div className="selection_image_container">
	        	<img
	        		key={`${nodeId}_thumbnail`}
	        		className="selection_image"
	        		src={this.props.imageMap.get(nodeId)}
	        		alt={`${nodeId}_thumbnail`} />
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

