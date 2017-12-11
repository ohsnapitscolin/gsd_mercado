class OverlayData {
	constructor(overlayObject) {
		this.property_ = overlayObject.property;
		this.overlayMap_ = new Map();

		for (let key in overlayObject.map) {
			const value = overlayObject.map[key];
			this.overlayMap_.set(
					value, new OverlayMapInfo(key, this.getRandomColor()));
		}
	}

	getProperty() {
		return this.property_;
	}

	getOverlayMap() {
		return this.overlayMap_;
	}

	getLabel(value) {
    for (let pair of this.overlayMap_) {
			if (value <= pair[0]) {
				return pair[1].getLabel();
			}
		};
	}

	getColor(value) {
    for (let pair of this.overlayMap_) {
			if (value <= pair[0]) {
				return pair[1].getColor();
			}
		};
	}

	getRandomColor() {
	  var letters = '0123456789ABCDEF';
	  var color = '#';
	  for (var i = 0; i < 6; i++) {
	    color += letters[Math.floor(Math.random() * 16)];
	  }
	  return color;
	}
}

class OverlayMapInfo {
	constructor(label, color) {
		this.label_ = label;
		this.color_ = color;
	}

	getLabel() {
		return this.label_;
	}

	getColor() {
		return this.color_;
	}
}

export default OverlayData;
