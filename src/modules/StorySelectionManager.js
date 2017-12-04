import React, { Component } from 'react';

import FilterManager from './FilterManager.js';


class StorySelectionManager extends Component {
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
		let stories = FilterManager.getFilteredStories(
				this.contentManager_, this.props.filterData);

		stories.forEach((storyData) => {
			const storyId = storyData.getId();
			grid.push(
        <div
        		key={storyId}
        		className={"selection selection_story"}
        		id={'selection-' + storyId}
        		onClick={() => {
        				this.contentManager_.updateActiveStoryId(storyId); }}>
        	<div className="selection_image_container">
	        	<img
	        		className="selection_image"
	        		src={this.props.imageMap.get(storyId)}
        			alt={`${storyId}_thumbnail`} />
      		</div>
        	{storyData.getName()}
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

export default StorySelectionManager;

