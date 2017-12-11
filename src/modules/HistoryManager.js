import { FilterParamEnum } from './FilterManager.js';


class HistoryManager {
	constructor(getHistoryFn) {
		this.getHistoryFn_ = getHistoryFn;
		this.searchParams_ = null;

		this.parseHistory();
	}

	getHistory() {
		const currentHistory = this.getHistoryFn_();
		if (!currentHistory ||
				!currentHistory.location) {
			return null;
		} else {
			return currentHistory;
		}
	}

	parseHistory() {
		const currentHistory = this.getHistory();
		if (!currentHistory) {
			return;
		}

		const searchParams = new URLSearchParams(currentHistory.location.search);

		const activeNode = searchParams.get('node') || null;
		const activeCharacter = searchParams.get('character') || null;
		const activeMaterial = searchParams.get('material') || null;
		const activeType = searchParams.get('type') || null;
		const activeStory = searchParams.get('story') || null;
		const activeOverlay = searchParams.get('overlay') || null;

		const activeFilterMap = this.getActiveFilterMap();

		if (activeNode) {
			this.setActiveNode(activeNode);
		} else if (activeCharacter) {
			this.setActiveCharacter(activeCharacter);
		} else if (activeMaterial) {
			this.setActiveMaterial(activeMaterial);
		} else if (activeType) {
			this.setActiveType(activeType);
		} else if (activeStory) {
			this.setActiveStory(activeStory);
		} else if (activeFilterMap.size > 0) {
			this.setActiveFilterMap(activeFilterMap);
		}
		this.push(false);

		console.log(searchParams.toString());
	}

	setActiveGrid(activeGrid) {
		this.setActiveParams(
				{'grid': activeGrid},
				['map', 'overlay'],
				true /* deleleteIfNull */);
	}

	getActiveGrid() {
		return this.getActiveParam('grid');
	}

	setActiveMap(activeMap) {
		this.setActiveParams(
				{'map': activeMap},
				null /* keysToKeep */,
				true /* deleleteIfNull */);
	}

	getActiveMap() {
		return this.getActiveParam('map');
	}

	setActiveOverlay(activeOverlay) {
		this.setActiveParams(
				{'overlay': activeOverlay},
				null /* keysToKeep */,
				true /* deleleteIfNull */);
	}

	getActiveOverlay() {
		return this.getActiveParam('overlay');
	}

	setActiveNode(activeNode) {
		this.setActiveParams(
				{'node': activeNode, 'grid': 'node'},
				['map', 'overlay'] /* keysToKeep */,
				true /* deleleteIfNull */);
	}

	getActiveNode() {
		return this.getActiveParam('node');
	}

	setActiveCharacter(activeCharacter) {
		this.setActiveParams(
			{'character': activeCharacter, 'grid': 'character'},
			['map', 'overlay'] /* keysToKeep */,
			true /* deleleteIfNull */);
	}

	getActiveCharacter() {
		return this.getActiveParam('character');
	}

	setActiveMaterial(activeMaterial) {
		this.setActiveParams(
			{'material': activeMaterial, 'grid': 'material'},
			['map', 'overlay'] /* keysToKeep */,
			true /* deleleteIfNull */);
	}

	getActiveMaterial() {
		return this.getActiveParam('material');
	}

	setActiveType(activeType) {
		this.setActiveParams(
				{'type': activeType, 'grid': 'type'},
				['map', 'overlay'] /* keysToKeep */,
				true /* deleleteIfNull */);
	}

	getActiveType() {
		return this.getActiveParam('type');
	}

	setActiveStory(activeStory) {
		this.setActiveParams(
				{'story': activeStory, 'grid': 'story'},
				['map', 'overlay'] /* keysToKeep */,
				true /* deleleteIfNull */);
	}

	getActiveStory() {
		return this.getActiveParam('story');
	}


	setActiveFilter(fitlerType, filterValue, clearExisting) {
		const activeFilterMap = !clearExisting ?
				this.getActiveFilterMap() : new Map();
		activeFilterMap.set(fitlerType, filterValue);
		this.setActiveFilterMap(activeFilterMap);
	}

	clearActiveFilters() {
		this.setActiveFilterMap(new Map());
	}

	setActiveFilterMap(activeFilterMap) {
    const paramsObject = {};
    for (let pair of activeFilterMap) {
  		paramsObject[pair[0]] = pair[1];
		}
		this.setActiveParams(
				paramsObject,
				['grid', 'map', 'overlay']  /* keysToKeep */,
				true /* deleleteIfNull */);
	}

	getActiveFilterMap() {
		const activeFilterMap = new Map();
		for (let param of Object.values(FilterParamEnum)) {
			activeFilterMap.set(param, this.getActiveParam(param));
		}
		return activeFilterMap;
	}

	setActiveParams(params, keysToKeep, deleteIfNull) {
		const currentHistory = this.getHistory();
		if (!currentHistory) {
			return;
		}

		this.searchParams_ = this.searchParams_ ||
				new URLSearchParams(currentHistory.location.search);

		const keysIterator = this.searchParams_.keys();
		let step = keysIterator.next();
		while (!step.done) {
			const key = step.value;
			if (!keysToKeep) {
				break;
			} else if (!keysToKeep.includes(key) &&
					!Object.keys(params).includes(key)) {
				this.searchParams_.delete(key);
			}
			step = keysIterator.next();
		}

		Object.keys(params).forEach((key) => {
			const value = params[key];
			if (value) {
				this.searchParams_.set(key, value);
			} else if (deleteIfNull) {
				this.searchParams_.delete(key);
			}
		});
	}

	push(addToHistory) {
		const currentHistory = this.getHistory();
		if (!currentHistory || !this.searchParams_) {
			return;
		}

		const currentSearchParams =
				new URLSearchParams(currentHistory.location.search);
		const searchParmsString = this.searchParams_.toString();
		this.searchParams_ = null;

		if (currentSearchParams.toString() === searchParmsString) {
			return;
		}

		if (!addToHistory) {
			console.log('replace: ' + searchParmsString);
			currentHistory.replace({
				search: searchParmsString
			});
		} else {
			console.log('push: ' + searchParmsString);
			currentHistory.push({
				search: searchParmsString
			});
		}
	}

	getActiveParam(key) {
		const currentHistory = this.getHistory();
		if (!currentHistory) {
			return null;
		}
		return new URLSearchParams(currentHistory.location.search).get(key);
	}
}

export default HistoryManager;
