import React, { Component } from 'react';
import $ from 'jquery';

class MapHover extends Component {
	constructor(props) {
		super(props);
		this.state = {
			top: 0,
			left: 0,
			visible: false,
			name: 'Name',
			text: 'Text'
		};
		this.isHovered_ = false;
		this.properties_ = null;
	}

	componentDidMount() {
		this.updateStyle();
		// this.addHover();
		this.addUnclickListener();
	}

	componentDidUpdate() {
		this.updateStyle();
	}

	updateStyle() {
		console.log('updateStyle');
		$('#map_hover').css({
	    'visibility': this.state.visible ? 'visible' : 'hidden',
	    'top': this.state.top,
	    'left': this.state.left
	  });
	}

	addUnclickListener() {
		$(document).mouseup((e) => {
	    var container = $("#map_hover");
	    // If the target of the click isn't the container nor a descendant of the
	    // container
	    if (this.state.visible && !container.is(e.target) &&
	    		container.has(e.target).length === 0) {
	    	this.setState({ visible: false });
	    }
		});
	}

	showHover(mapBottom, mapRight, top, left, properties) {
		if (!properties) {
			return;
		}
		const hoverWidth = $('#map_hover').width();
		const hoverHeight = $('#map_hover').height();

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

		this.properties_ = properties;
		this.setState({
			name: properties.Name,
			top: top,
			left: left,
			visible: true
		});
	}

	addHover() {
		var mapHover = $('#map_hover');
		console.log(mapHover);
		mapHover.hover(() => {
			console.log('hover!')
			this.isHovered_ = true;
		}, () => {
			this.isHovered_ = false;
			this.hideHover();
		});
	}

	hideHover() {
		console.log('hideHover!');
		console.log(this.isHovered_);
		if (this.isHovered_) {
			return;
		}
		this.setState({
			visible: false
		});
	}

	onNodeClick() {
		console.log('click!');
		this.setState({ visible: false });
		this.props.hoverClick(this.properties_.OID_);
	}

	render() {
		return (
			<div id='map_hover'>
				<h2> {this.state.name} </h2>
				<h3> {this.state.text} </h3>
				<h4> {this.state.text} </h4>
				<button
						onClick={() => { this.onNodeClick(); }}>
					Click Me!
				</button>
			</div>
		);
	}
}

export default MapHover;