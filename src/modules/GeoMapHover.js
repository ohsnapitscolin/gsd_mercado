import React, { Component } from 'react';
import $ from 'jquery';

class GeoMapHover extends Component {
	constructor(props) {
		super(props);

		this.contentManager_ = props.contentManager;

		this.state = {
			top: 0,
			left: 0,
			visible: false,
			node: null
		};
	}

	componentDidMount() {
		this.updateStyle();
		this.addUnclickListener();
	}

	componentDidUpdate() {
		this.updateStyle();
	}

	updateStyle() {
		$('#geo_map_hover').css({
	    'visibility': this.state.visible ? 'visible' : 'hidden',
	    'top': this.state.top,
	    'left': this.state.left
	  });
	}

	addUnclickListener() {
		$(document).mouseup((e) => {
	    var container = $("#geo_map_hover");
	    // If the target of the click isn't the container nor a descendant of the
	    // container
	    if (!container.is(e.target) && container.has(e.target).length === 0) {
				this.unclick();
	    }
		});
	}

	unclick() {
		if (this.state.visible) {
			const nodeData =
				this.contentManager_.getNodeByGeoId(this.state.geoId);
			this.setState({ visible: false });
			this.contentManager_.unhoverNodeId(nodeData.getId());
		}
	}

	showHover(mapBottom, mapRight, top, left, geoId) {
		const maxHoverWidth = 200;
		const maxHoverHeight = 200;

		if (left + maxHoverWidth > mapRight) {
			left -= maxHoverWidth + 1;
		} else {
			left -= 1;
		}
		if (top + maxHoverHeight > mapBottom) {
			top -= maxHoverHeight + 1;
		} else {
			top -= 1;
		}

		this.setState({
			geoId: geoId,
			top: top,
			left: left,
			visible: true,
		});
	}

	clickNode() {
		const nodeData =
				this.contentManager_.getNodeByGeoId(this.state.geoId);
		if (!nodeData) {
			return;
		}
		this.unclick();
		this.contentManager_.updateActiveNodeId(nodeData.getId());
	}

	render() {
		const nodeData =
				this.contentManager_.getNodeByGeoId(this.state.geoId);
		if (!nodeData) {
			return (<div/>);
		}

		return (
			<div id='geo_map_hover'>
				<div> {nodeData.getName()} </div>
				<div> {nodeData.getTypeId()} </div>
				<button
						onClick={() => { this.clickNode(); }}>
					See More
				</button>
			</div>
		);
	}
}

export default GeoMapHover;