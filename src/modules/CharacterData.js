class CharacterData {
	constructor(characterObject) {
		this.id_ = characterObject.id;
		this.name_ = characterObject.name || "Unknown Name";
		this.formality_ = characterObject.formality || 0;
		this.job_ = characterObject.job || "Unknown Job";
		this.payType_ = characterObject.pay_type || 0;
		this.home_ = characterObject.home || "Unknown Home";
		this.text_ = characterObject.text || "";
		this.images_ = characterObject.images || [];

		this.nodes_ = [];
		this.materials_ = [];
	}

	setNodes(nodes) {
		this.nodes_ = nodes;
	}

	getNodes() {
		return this.nodes_;
	}

	setMaterials(materials) {
		this.materials_ = materials;
	}

	getMaterials() {
		return this.materials_;
	}

	getId() {
		return this.id_;
	}

	getName() {
		return this.name_;
	}

	getFormality() {
		return this.formality_;
	}

	getJob() {
		return this.job_;
	}

	getPayType() {
		return this.payType_;
	}

	getHome() {
		return this.home_;
	}

	getText() {
		return this.text_;
	}

	getImages() {
		return this.images_;
	}
}

export default CharacterData;
