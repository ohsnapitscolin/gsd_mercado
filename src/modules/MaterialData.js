class MaterialData {
	constructor(materialObject) {
		this.id_ = materialObject.id;
		this.name_ = materialObject.name || "Unknown Name";
		this.text_ = materialObject.text || "";
		this.images_ = materialObject.images || [];
	}

	getId() {
		return this.id_;
	}

	getName() {
		return this.name_;
	}

	getText() {
		return this.text_;
	}

	getImages() {
		return this.images_;
	}
}

export default MaterialData;
