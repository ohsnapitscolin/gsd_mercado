import $ from 'jquery';
import React, { Component } from 'react';


class Edit extends Component {
	constructor(props) {
		super(props)

		const nodesJson = require('../resources/nodes.json');
		const storiesJson = require('../resources/stories.json');

		this.state = {
			nodesJson: nodesJson,
			storiesJson: storiesJson
		}
	}

	componentDidUpdate() {
		console.log(this.state.nodesJson);
	}

	renderNodes() {
		var items = [];
		for (var i = 0; i < this.state.nodesJson.length; i++) {
			var nodesJson = this.state.nodesJson[i];
		  for (var key in nodesJson) {
	      if (nodesJson.hasOwnProperty(key)) {
	      		items.push(this.createForm('nodesJson', i, key));
	      }
	    }
		}
		return items;
	}

	createForm(objectName, index, key) {
		return (
			<div key={index+key}>
				<form>
				{key}:
				<input
					type="text"
					value={this.state[objectName][index][key]}
				  onChange={(event) => {
				  	let object = this.state[objectName];
				  	object[index][key] = event.target.value;
				  	this.setState({
				  		objectName: object
				  	})
				  }}/>
				</form>
			</div>
		)
	}

	render() {
		return(
			<div>
				{this.renderNodes()}
			</div>
		);
	}
}

export default Edit;

