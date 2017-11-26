class MaterialData {
	constructor(materialObject) {
		this.id_ = materialObject.id;
		this.name_ = materialObject.name || "Unknown Name";
	}

	getId() {
		return this.id_;
	}

	getName() {
		return this.name_;
	}
}

export default MaterialData;
