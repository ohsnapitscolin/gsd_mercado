class ActiveParamChangeData {
	constructor(mapTypeChanged,
			gridTypeChanged,
			nodeIdChanged,
			characterIdChanged,
			materialIdChanged,
			typeIdChanged,
			storyIdChanged,
			filterTypeChanged) {
		this.mapTypeChanged_ = mapTypeChanged;
		this.gridTypeChanged_ = gridTypeChanged;
		this.nodeIdChanged_ = nodeIdChanged;
		this.characterIdChanged_ = characterIdChanged;
		this.materialIdChanged_ = materialIdChanged;
		this.typeIdChanged_ = typeIdChanged;
		this.storyIdChanged_ = storyIdChanged;
		this.filterTypeChanged_ = filterTypeChanged;
	}

	mapTypeChanged() {
		return this.mapTypeChanged_;
	}

	gridTypeChanged() {
		return this.gridTypeChanged_;
	}

	nodeIdChanged() {
		return this.nodeIdChanged_;
	}

	characterIdChanged() {
		return this.characterIdChanged_;
	}

	materialIdChanged() {
		return this.materialIdChanged_;
	}

	typeIdChanged() {
		return this.typeIdChanged_;
	}

	storyIdChanged() {
		return this.storyIdChanged_;
	}

	filterTypeChanged() {
		return this.filterTypeChanged_
	}
}

export default ActiveParamChangeData;
