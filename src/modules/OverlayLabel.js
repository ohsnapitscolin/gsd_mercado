import React, { Component } from 'react';
import $ from 'jquery';

class OverlayLabel extends Component {
	render() {
		const overlayData = this.props.overlayData;

		if (!overlayData) {
			return (<div/>);
		}

		let labels = [];
		const overlayMap = overlayData.getOverlayMap();
		let previousValue = 0;
		overlayMap.forEach((value, key) => {
			labels.push(
				<div key={key} className="overlay_label">
					<div
						className="overlay_icon"
						style={{"background-color": value.getColor()}}/>
					<div className="overlay_title">
						{value.getLabel()}
					</div>
					<div className="overlay_value">
						{`${previousValue} to ${key}`}
					</div>
				</div>
			)
			previousValue = key;
		});

		return (
			<div className="overlay_labels">
				{overlayData.getProperty()}
				{labels}
			</div>
		);
	}
}

export default OverlayLabel;