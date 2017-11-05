import React, { Component } from 'react';
import $ from 'jquery';
import PubSub from 'pubsub-js';


class HistoryManager {
	constructor(getHistoryFn) {
		this.getHistoryFn_ = getHistoryFn;
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

		const activeGrid = searchParams.get('grid') || null;
		const activeNode = searchParams.get('node') || null;
		const activeType = searchParams.get('type') || null;
		const activeStory = searchParams.get('story') || null;
		const activeFilter = searchParams.get('filter') || null;

		if (activeNode) {
			this.setActiveNode(activeNode, false /* addToHistory */)
		} else if (activeType) {
			this.setActiveType(activeType, false /* addToHistory */)
		} else if (activeStory) {
			this.setActiveStory(activeStory, false /* addToHistory */)
		} else if (activeFilter) {
			this.setActiveFilter(activeFilter, false /* addToHistory */)
		}

		console.log(searchParams.toString());
	}

	setActiveGrid(activeGrid, addToHistory) {
		return this.setActiveParams(
				{'grid': activeGrid},
				addToHistory,
				['node', 'type', 'story', 'filter'] /* keysToRemove */,
				true /* deleleteIfNull */);
	}

	getActiveGrid() {
		return this.getActiveParam('grid');
	}

	setActiveMap(activeMap, addToHistory) {
		return this.setActiveParams(
				{'map': activeMap},
				addToHistory,
				[] /* keysToRemove */,
				true /* deleleteIfNull */);
	}

	getActiveMap() {
		return this.getActiveParam('map');
	}

	setActiveNode(activeNode, addToHistory) {
		return this.setActiveParams(
				{'node': activeNode, 'grid': 'node'},
				addToHistory,
				['type', 'story', 'filter'] /* keysToRemove */,
				true /* deleleteIfNull */);
	}

	getActiveNode() {
		return this.getActiveParam('node');
	}

	setActiveType(activeType, addToHistory) {
		return this.setActiveParams(
				{'type': activeType, 'grid': 'type'},
				addToHistory,
				['node', 'story', 'filter'] /* keysToRemove */,
				true /* deleleteIfNull */);
	}

	getActiveType() {
		return this.getActiveParam('type');
	}

	setActiveStory(activeStory, addToHistory) {
		return this.setActiveParams(
				{'story': activeStory, 'grid': 'story'},
				addToHistory,
				['node', 'type', 'filter'] /* keysToRemove */,
				true /* deleleteIfNull */);
	}

	getActiveStory() {
		return this.getActiveParam('story');
	}

	setActiveFilter(activeFilter, addToHistory) {
		return this.setActiveParams(
				{'filter': activeFilter, 'grid': 'selection'},
				addToHistory,
				['node', 'type', 'story'] /* keysToRemove */,
				true /* deleleteIfNull */);
	}

	getActiveFilter() {
		return this.getActiveParam('filter');
	}

	setActiveParams(params, addToHistory, keysToRemove, deleteIfNull) {
		const currentHistory = this.getHistory();
		if (!currentHistory) {
			return;
		}

		const currentSearchParams =
				new URLSearchParams(currentHistory.location.search);
		const searchParams =
				new URLSearchParams(currentHistory.location.search);

		let valueChanged = false;
		Object.keys(params).forEach(function(key) {
			const value = params[key];
			const currentValue = searchParams.get(key) || null;
			if (!valueChanged) {
				valueChanged = currentValue != value;
			}

			for (let i = 0; i < keysToRemove.length; i++) {
				searchParams.delete(keysToRemove[i]);
			}

			if (value) {
				searchParams.set(key, value);
			} else if (deleteIfNull) {
				searchParams.delete(key);
			}
		});

		if (currentSearchParams.toString() == searchParams.toString()) {
			return valueChanged;
		}

		if (!addToHistory || !valueChanged) {
			console.log('replace: ' + searchParams.toString());
			currentHistory.replace({
				search: searchParams.toString()
			});
		} else {
			console.log('push: ' + searchParams.toString());
			currentHistory.push({
				search: searchParams.toString()
			});
		}

		return valueChanged;
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
