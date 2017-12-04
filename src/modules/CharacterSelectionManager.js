import React, { Component } from 'react';

import FilterManager from './FilterManager.js';


class CharacterSelectionManager extends Component {
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
		let characters = FilterManager.getFilteredCharacters(
				this.contentManager_, this.props.filterData);

		characters.forEach((characterData) => {
			const characterId = characterData.getId();
			grid.push(
        <div
        		key={characterId}
        		className={"selection selection_character"}
        		id={'selection-' + characterId}
        		onClick={() => {
		      			this.contentManager_.updateActiveCharacterId(characterId); }}>
        	<div className="selection_image_container">
	        	<img
	        		className="selection_image"
	        		src={this.props.imageMap.get(characterId)}
	        		alt={`${characterId}_thumbnail`} />
      		</div>
        	{characterData.getName()}
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

export default CharacterSelectionManager;

