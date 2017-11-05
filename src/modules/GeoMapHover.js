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
			const node = this.state.node;
			this.setState({ visible: false });
			this.contentManager_.unhoverNode(node.getId());
		}
	}

	showHover(mapBottom, mapRight, top, left, node) {
		if (!node) {
			return;
		}

		const hoverWidth = $('#geo_map_hover').width();
		const hoverHeight = $('#geo_map_hover').height();

		if (left + hoverWidth > mapRight) {
			left -= hoverWidth + 1;
		} else {
			left -= 1;
		}
		if (top + hoverHeight > mapBottom) {
			top -= hoverHeight + 1;
		} else {
			top -= 1;
		}

		this.setState({
			top: top,
			left: left,
			visible: true,
			node: node,
		});
	}

	clickNode() {
		const node = this.state.node;
		if (!node) {
			return;
		}
		this.unclick();
		this.contentManager_.updateActiveNodeId(node.getId());
	}

	render() {
		const node = this.state.node;
		if (!node) {
			return (<div/>);
		}

		return (
			<div id='geo_map_hover'>
				<h2> {node.getName()} </h2>
				<h3> {node.getId()} </h3>
				<h4> {node.getGeoId()} </h4>
				<button
						onClick={() => { this.clickNode(); }}>
					Click Me!
				</button>
			</div>
		);
	}
}

export default GeoMapHover;