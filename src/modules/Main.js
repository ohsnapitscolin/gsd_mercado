import $ from 'jquery';
import React, { Component } from 'react';
import * as firebase from 'firebase';

import ContentManager from './ContentManager.js'
import GridManager from './GridManager.js'
import MapManager from './MapManager.js'


class Main extends Component {
	constructor(props) {
		super(props)
		this.contentManager_ = new ContentManager();

		const nodesJson = require('../resources/nodes.json');
		const storiesJson = require('../resources/stories.json');
    const typesJson = require('../resources/types.json');

		this.contentManager_.loadNodes(
				nodesJson, storiesJson, typesJson);

		this.gridManager_ = null;
		this.mapManager_ = null;
	}

	render() {
		return(
			<div className="home">
	 			<div id="main_content">
		      <GridManager
		      		contentManager = {this.contentManager_}
			      	ref={(node) => { this.gridManager_ = node; }}/>
				 	<MapManager
							contentManager = {this.contentManager_}
				 			ref={(node) => { this.mapManager_ = node; }}/>
	 			</div>
			</div>
		);
	}
}

export default Main;

