class NodeData {
	constructor(nodeObject) {
		this.nodeId_ = nodeObject.id;
		this.geoId_ = nodeObject.geoId || -1;
		this.typeId_ = nodeObject.typeId || -1;
		this.name_ = nodeObject.name || "Unknown Name";
		this.workers_ = nodeObject.workers || -1;

		this.materials_ = [];
		this.materialIds_ = [];
	}

	setMaterials(materials) {
		this.materials_ = materials;
		for (let i = 0; i < materials.length; i++) {
			this.materialIds_.push(materials[i].getId());
		}
	}

	getMaterials() {
		return this.materials_;
	}

	getMaterialIds() {
		return this.materialIds_;
	}

	getId() {
		return this.nodeId_;
	}

	getGeoId() {
		return this.geoId_;
	}

	getTypeId() {
		return this.typeId_;
	}

	getName() {
		return this.name_;
	}

	getWorkers() {
		return this.workers_;
	}
}

export default NodeData;
