import $ from 'jquery';
import React from 'react';

export const FilterTypeEnum = {
	// General Filters
	NONE: "none",
	MATERIAL: "material",
	TYPE: "type",

	// Node Filters
	SEPARATION: "separation",
	CHARACTERS: "characters",

	// Charcter Filters
	FORMAILITY: "formatily",
	PAY_TYPE: "pay_type",
	LOCATION: "location",
	JOB: "job"
};

export const FilterParamEnum = {
	CHARACTER: "c",
	MATERIAL: "m",
	SEPARATION: "s",
	TYPE: "t"
}


class FilterManager {
	static getFilteredStories(contentManager, filterMap) {
		return contentManager.getStories();
	}

	static getFilteredCharacters(contentManager, filterMap) {
		return contentManager.getCharacters();
	}

	static getFilteredMaterials(contentManager, filterMap) {
		return contentManager.getMaterials();
	}

	static getFilteredNodes(contentManager, filterMap) {
		const nodesArray = [];
		contentManager.getNodes().forEach((node) => {
			nodesArray.push(node);
		});
		return this.applyNodeFilter(contentManager, nodesArray, filterMap);
	}

	static applyNodeFilter(contentManager, nodes, filterMap) {
		const activeFilterMap = new Map();
		for (let pair of filterMap) {
			if (pair[1] === null) {
				continue;
			} else {
				activeFilterMap.set(pair[0], pair[1]);
			}
		}

		if (!activeFilterMap.size) {
			return nodes;
		}

		let updatedNodes = [];
		nodes.forEach((node) => {
			let displayNode = true;
			for (let pair of activeFilterMap) {
				if (pair[1] === null) {
					continue;
				}
				switch(pair[0]) {
					case FilterParamEnum.CHARACTER:
						if (!contentManager.getNodesForCharacterId(pair[1])
								.includes(node)) {
							displayNode = false;
						}
						break;
					case FilterParamEnum.MATERIAL:
						if (!node.getMaterialIds().includes(pair[1])) {
							displayNode = false;
						}
						break;
					case FilterParamEnum.TYPE:
						if (node.getTypeId() !== pair[1]) {
							displayNode = false;
						}
						break;
					default:
						break;
				}
				if (!displayNode) {
					break;
				}
			}
			if (displayNode) {
				updatedNodes.push(node);
			}
		});
		return updatedNodes;
	}


	static renderTypeFilter(contentManager, filterMap, className, onClick) {
		let data = {};
		data.className = className;
		data.onClick = onClick;

		const activeId = filterMap.get(FilterParamEnum.TYPE) || null;
		data.activeId = activeId;

		const activeData = contentManager.getType(activeId);
		const activeName = activeData ? activeData.getName() : "Type";
		data.activeName = activeName;

		data.dataMap = contentManager.getTypes();
		data.filterType = "type";

		return this.renderFilter(data);
	}

	static renderMaterialFilter(contentManager, filterMap, className, onClick) {
		let data = {};
		data.className = className;
		data.onClick = onClick;

		const activeId = filterMap.get(FilterParamEnum.MATERIAL) || null;
		data.activeId = activeId;

		const activeData = contentManager.getMaterialData(activeId);
		const activeName = activeData ? activeData.getName() : "Material";
		data.activeName = activeName;

		data.dataMap = contentManager.getMaterials();
		data.filterType = "material";

		return this.renderFilter(data);
	}

	static renderCharacterFilter(contentManager, filterMap, className, onClick) {
		let data = {};
		data.className = className;
		data.onClick = onClick;

		const activeId = filterMap.get(FilterParamEnum.CHARACTER) || null;
		data.activeId = activeId;

		const activeData = contentManager.getCharacterData(activeId);
		const activeName = activeData ? activeData.getName() : "People";
		data.activeName = activeName;

		data.dataMap = contentManager.getCharacters();
		data.filterType = "characters";

		return this.renderFilter(data);
	}

	static renderFilter(data) {
		const className = data.className;
		const onClick = data.onClick;

		const activeId = data.activeId;
		const activeName = data.activeName;
		const filterType = data.filterType;

		let dropdownOptions = [];

		const dataMap = data.dataMap;
		dataMap.forEach((data) => {
			let optionClassName = `filter_option {filterType}_filter_option`
			if (data.getId() === activeId) {
				optionClassName += " active";
			}
			dropdownOptions.push(
				<div
					key={`${data.getId()}_filter_option`}
					className={optionClassName}
					onClick={() => {
						$(`.${filterType}_filter_options`).hide();
						onClick(data.getId());
					}}>
					{data.getName()}
				</div>
			);
		});

		const showClearOption = activeId != null;
		let clearOption = [];
		if (showClearOption) {
			clearOption.push(
				<div
					key={`${filterType}_filter_clear`}
					className="filter_clear"
					onClick={() => { onClick(null); }}>
					x
				</div>
			);
		}

		$(document).unbind(`.${filterType}_filter_event`);
		$(document).bind(`mouseup.${filterType}_filter_event`, (e) => {
	    var container = $(`.${filterType}_filter_options`);
	    if (!container.is(e.target) && container.has(e.target).length === 0) {
	    	container.hide();
	    }
		});

		return (
			<div className="filter_wrapper">
				<div className=
						{`filter ${filterType}_filter ${className}_${filterType}_filter`}>
					<div
						className={`filter_button ${filterType}_filter_button`}
						onClick={() => {
							$(`.${filterType}_filter_options`).show();
						}}>
						{activeName}
					</div>
					<div className={`filter_options ${filterType}_filter_options`}>
						{dropdownOptions}
					</div>
				</div>
				{clearOption}
			</div>
		)
	}
}

export default FilterManager;
