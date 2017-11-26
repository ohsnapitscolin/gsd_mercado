class FilterData {
	constructor(filterType, filterValue) {
		this.filterType_ = filterType;
		this.filterValue_ = filterValue;
	}

	getFilterType() {
		return this.filterType_;
	}

	getFilterValue() {
		return this.filterValue_;
	}
}

export default FilterData;
