class Type {
	constructor(typeObject) {
		this.id_ = typeObject.id;
		this.category_ = typeObject.category;
		this.text_ = typeObject.text || "";
		this.images_ = typeObject.images || [];
	}

	getId() {
		return this.id_;
	}

	getName() {
		return this.id_;
	}

	getCategory() {
		return this.category_;
	}

	getText() {
		return this.text_;
	}

	getImages() {
		return this.images_;
	}
}

export default Type;
