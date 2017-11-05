import $ from 'jquery';
import React, { Component } from 'react';
import * as firebase from 'firebase';

import HistoryManager from './HistoryManager.js';
import ContentManager from './ContentManager.js'
import GridManager from './GridManager.js'
import MapManager from './MapManager.js'

import { ContentTypeEnum } from './ContentManager.js';

class Main extends Component {
	constructor(props) {
		super(props);

		this.historyManager_ = new HistoryManager(() => {
			return this.props.history;
		});

		const nodesJson = require('../resources/nodes.json');
		const storiesJson = require('../resources/stories.json');
    const typesJson = require('../resources/types.json');

		this.contentManager_ = new ContentManager(
				nodesJson,
				storiesJson,
				typesJson,
				this.historyManager_);

		this.gridManager_ = null;
		this.mapManager_ = null;
	}

	componentDidMount() {
		// this.props.history.push({
		// 	search: '?test=true'
		// });
		this.contentManager_.publishActiveParamChanges();
	}

	componentDidUpdate() {
		this.contentManager_.publishActiveParamChanges();
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
