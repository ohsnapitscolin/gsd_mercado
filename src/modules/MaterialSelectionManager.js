import React, { Component } from 'react';

import FilterManager from './FilterManager.js';


class MaterialSelectionManager extends Component {
	constructor(props) {
		super(props)
		this.contentManager_ = props.contentManager;
	}

	renderFilters() {
		return (
			<div id="filters"/>
		)
	}

	renderSelection() {
		let grid = [];
		let materials = FilterManager.getFilteredMaterials(
				this.contentManager_, this.props.filterData);

		materials.forEach((materialData) => {
			const materialId = materialData.getId();
			grid.push(
        <div
        		key={materialId}
        		className={"selection selection_material"}
        		id={'selection-' + materialId}
        		onClick={() => {
		      			this.contentManager_.updateActiveMaterialId(materialId); }}>
        	<div className="selection_image_container">
	        	<img
	        		className="selection_image"
	        		src={this.props.imageMap.get(materialId)}
	        		alt={`${materialId}_thumbnail`} />
      		</div>
        	{materialData.getName()}
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

export default MaterialSelectionManager;

