class ActiveParamChangeData {
	constructor(mapTypeChanged,
			gridTypeChanged,
			nodeIdChanged,
			typeIdChanged,
			storyIdChanged,
			filterTypeChanged) {
		this.mapTypeChanged_ = mapTypeChanged;
		this.gridTypeChanged_ = gridTypeChanged;
		this.nodeIdChanged_ = nodeIdChanged;
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
