import PubSub from 'pubsub-js';

import ActiveParamChangeData from './ActiveParamChangeData.js';
import NodeData from './NodeData.js';
import TypeData from './TypeData.js';
import StoryData from './StoryData.js';
import CharacterData from './CharacterData.js';
import MaterialData from './MaterialData.js';

export const MapTypeEnum = {
	NONE: 'none',
	GEO: 'geo',
  INFO: 'info',
};

export const GridTypeEnum = {
	NODE: 'node',
	CHARACTER: 'character',
	MATERIAL: 'material',
  TYPE: 'type',
  STORY: 'story',
  ABOUT: 'about'
};

export const ResourceStateEnum = {
	LOADING: 0,
	LOADED: 1
}

export const CONTENT_LOADED_EVENT = "contentLoadedEvent";
export const ACTIVE_PARAMS_CHANGE_EVENT = "activeParamChangeEvent";
export const HOVER_CHANGE_EVENT = "hoverChangeEvent";
export const FOCUS_CHANGE_EVENT = "focusedNodeChangeEvent";
export const RENDERED_CHAPTER_CHANGE_EVENT = "renderedChaptersChangeEvent";

const DEFAULT_MAP_TYPE = MapTypeEnum.GEO;
const DEFAULT_GRID_TYPE = GridTypeEnum.STORY;


class ContentManager {
	constructor(nodesJson,
			charactersJson,
			materialsJson,
			storiesJson,
			typesJson,
			historyManager) {
		this.nodeMap_ = new Map();
		this.geoToNodeMap_ = new Map();
		this.storyMap_ = new Map();
		this.characterMap_ = new Map();
		this.materialMap_ = new Map();

		this.nodeToStoriesMap_ = new Map();
		this.nodeToCharactersMap_ = new Map();

		this.materialsToCharactersMap_ = new Map();
		this.materialsToNodesMap_ = new Map();

		this.typeMap_ = new Map();
		this.typeToNodesMap_ = new Map();

		this.loadResources(
				nodesJson, charactersJson, materialsJson, storiesJson, typesJson);

		this.activeMapType_ = DEFAULT_MAP_TYPE;
		this.activeGridType_ = DEFAULT_GRID_TYPE;

		this.activeNodeId_ = null;
		this.activeCharacterId_ = null;
		this.activeMaterialId_ = null;
		this.activeTypeId_ = null;
		this.activeStoryId_ = null;
		this.activeFilterMap_ = new Map();
		this.activeOverlay_ = null;

		this.historyManager_ = historyManager;

		this.focusedNodeId_ = null;
		this.focusedGeoId_ = null;
		this.focusedTypeId_ = null;
		this.focusedStoryId_ = null;

		this.mapLoaded_ = false;
		this.gridLoaded_ = false;

		this.renderedChapterData_ = [];
	}

	loadResources(nodesJson, charactersJson, materialsJson, storiesJson, typesJson) {
		this.parseTypes(typesJson);
		this.parseMaterials(materialsJson);
    this.parseNodes(nodesJson);
		this.parseCharacters(charactersJson);
		this.parseStories(storiesJson);
	}

	importImage(nodeId, imageName) {
		return import(`../resources/images/nodes/${nodeId}/${imageName}`)
				.then((image) => {
					this.imageMap_.set(imageName, image);
				});
	}

	parseTypes(typesJson) {
		for (let i = 0; i < typesJson.length; i++) {
      const typeObject = typesJson[i];
      const type = new TypeData(typeObject);
      this.typeMap_.set(type.getId(), type);
    }
	}

	parseMaterials(materialsJson) {
		for (let i = 0; i < materialsJson.length; i++) {
      const materialsObject = materialsJson[i];
      const materialData = new MaterialData(materialsObject);
      this.materialMap_.set(materialData.getId(), materialData);
    }
	}

	parseNodes(nodesJson) {
		for (let i = 0; i < nodesJson.length; i++) {
			const nodeObject = nodesJson[i];
			const nodeData = new NodeData(nodeObject);

			let materials = [];
			for (let j = 0; j < nodeObject.materials.length; j++) {
				const materialId = nodeObject.materials[j];
				const materialData = this.getMaterialData(materialId);
				materials.push(materialData);

				let nodeDataArray = this.materialsToNodesMap_.get(materialId);
				if (!nodeDataArray) {
					nodeDataArray = []
				}
				nodeDataArray.push(nodeData);
				this.materialsToNodesMap_.set(materialId, nodeDataArray);
			}

			nodeData.setMaterials(materials);
			this.nodeMap_.set(nodeData.getId(), nodeData);
			this.geoToNodeMap_.set(nodeData.getGeoId() + "", nodeData);

			const typeId = nodeData.getTypeId();
			let nodesArray = this.typeToNodesMap_.get(typeId);
			if (!nodesArray) {
				nodesArray = [];
			}
			nodesArray.push(nodeData);
			this.typeToNodesMap_.set(typeId, nodesArray);
		}
	}

	parseCharacters(charactersJson) {
		for (let i = 0; i < charactersJson.length; i++) {
			const characterObject = charactersJson[i];
			const characterData = new CharacterData(characterObject);

			let nodes = [];
			for (let j = 0; j < characterObject.nodes.length; j++) {
				const nodeId = characterObject.nodes[j];
				const node = this.getNode(nodeId);
				nodes.push(node);

				let characterDataArray = this.nodeToCharactersMap_.get(nodeId);
				if (!characterDataArray) {
					characterDataArray = [];
				}
				characterDataArray.push(characterData);
				this.nodeToCharactersMap_.set(nodeId, characterDataArray);
			}

			let materials = [];
			for (let j = 0; j < characterObject.materials.length; j++) {
				const materialId = characterObject.materials[j];
				const materialData = this.getMaterialData(materialId);
				materials.push(materialData);

				let characterDataArray = this.materialsToCharactersMap_.get(materialId);
				if (!characterDataArray) {
					characterDataArray = []
				}
				characterDataArray.push(characterData);
				this.materialsToCharactersMap_.set(materialId, characterDataArray);
			}

			characterData.setNodes(nodes);
			characterData.setMaterials(materials)
			this.characterMap_.set(characterData.getId(), characterData);
		}
	}

	parseStories(storiesJson) {
		for (let i = 0; i < storiesJson.length; i++) {
			const storyObject = storiesJson[i];
			const storyNode = new StoryData(storyObject);

			let nodes = [];
			for (let j = 0; j < storyObject.nodes.length; j++) {
				const nodeId = storyObject.nodes[j];
				const node = this.getNode(nodeId)
				nodes.push(node);

				let storyNodesArray = this.nodeToStoriesMap_.get(nodeId);
				if (!storyNodesArray) {
					storyNodesArray = [];
				}
				storyNodesArray.push(storyNode);
				this.nodeToStoriesMap_.set(nodeId, storyNodesArray);
			}

			storyNode.setNodes(nodes);

			const storyId = storyNode.getId();
			this.storyMap_.set(storyId, storyNode);
		}
	}

	getNodes() {
		return this.nodeMap_;
	}

	getCharacters() {
		return this.characterMap_;
	}

	getMaterials() {
		return this.materialMap_;
	}

	getTypes() {
		return this.typeMap_;
	}

	getStories() {
		return this.storyMap_;
	}

	getNodeData(nodeId) {
		return this.nodeMap_.get(nodeId) || null;
	}

	getMaterialData(materialId) {
		return this.materialMap_.get(materialId) || null;
	}

	getStoryData(storyId) {
		return this.storyMap_.get(storyId) || null;
	}

	getCharacterData(characterId) {
		return this.characterMap_.get(characterId) || null;
	}

	getTypeData(typeId) {
		return this.typeMap_.get(typeId) || null;
	}

	getTypesForStoryId(storyId) {
		let types = [];
		const storyData = this.getStoryData(storyId);
		if (storyData) {
			const nodes = storyData.getNodes();
			for (let i = 0; i < nodes.length; i++) {
				types.push(this.typeMap_.get(nodes[i].getTypeId()));
			}
		}
		return types;
	}

	getTypesForCharacterId(characterId) {
		let types = [];
		const nodes = this.getNodesForCharacterId(characterId);
		for (let i = 0; i < nodes.length; i++) {
			types.push(this.typeMap_.get(nodes[i].getTypeId()));
		}
		return types;
	}

	getTypesForMaterialId(materialId) {
		let types = [];
		const nodes = this.getNodesForMaterialId(materialId);
		for (let i = 0; i < nodes.length; i++) {
			types.push(this.typeMap_.get(nodes[i].getTypeId()));
		}
		return types;
	}

	getNodesForStoryId(storyId) {
		const storyData = this.getStoryData(storyId);
		return storyData ? storyData.getNodes() : [];
	}

	getNodesForCharacterId(characterId) {
		const characterData = this.getCharacterData(characterId);
		return characterData ? characterData.getNodes() : [];
	}

	getCharactersForNodeId(nodeId) {
		return this.nodeToCharactersMap_.get(nodeId) || [];
	}

	getMaterialsForNodeId(nodeId) {
		const nodeData = this.getNodeData(nodeId);
		return nodeData ? nodeData.getMaterials() : [];
	}

	getMaterialsForCharacterId(characterId) {
		const characterData = this.getCharacterData(characterId);
		return characterData ? characterData.getMaterials() : [];
	}

	getNodesForMaterialId(materialId) {
		return this.materialsToNodesMap_.get(materialId) || [];
	}

	getCharactersForMaterialId(materialId) {
		return this.materialsToCharactersMap_.get(materialId) || [];
	}

	getStoriesForNodeId(nodeId) {
		return this.nodeToStoriesMap_.get(nodeId) || [];
	}

	getNodesForTypeId(typeId) {
		return this.typeToNodesMap_.get(typeId) || [];
	}

	getNode(nodeId) {
		return this.nodeMap_.get(nodeId);
	}

	getNodeByGeoId(geoId) {
		return this.geoToNodeMap_.get(geoId);
	}

	getType(typeId) {
		return this.typeMap_.get(typeId);
	}

	// Update actives

	updateActiveMapType(mapType) {
		this.historyManager_.setActiveMap(mapType);
		this.historyManager_.push(false);
	}

	updateActiveGridType(gridType) {
		this.historyManager_.setActiveGrid(gridType);
		this.historyManager_.push(true);
	}

	updateActiveNodeId(nodeId) {
		this.historyManager_.setActiveNode(nodeId);
		this.historyManager_.push(true);
	}

	updateActiveCharacterId(characterId) {
		this.historyManager_.setActiveCharacter(characterId);
		this.historyManager_.push(true);
	}

	updateActiveMaterialId(materialId) {
		this.historyManager_.setActiveMaterial(materialId);
		this.historyManager_.push(true);
	}

	updateActiveTypeId(typeId) {
		this.historyManager_.setActiveType(typeId);
		this.historyManager_.push(true);
	}

	updateActiveStoryId(storyId) {
		this.historyManager_.setActiveStory(storyId);
		this.historyManager_.push(true);
	}

	clearActiveFilters() {
		this.historyManager_.clearActiveFilters();
		this.historyManager_.push(false);
	}

	setActiveFilter(filterType, filterValue, clearExisting) {
		this.historyManager_.setActiveFilter(
				filterType, filterValue, clearExisting);
		this.historyManager_.push(false);
	}

	updateActiveOverlay(overlay) {
		this.historyManager_.setActiveOverlay(overlay);
		this.historyManager_.push(true);
	}

	publishActiveParamChanges() {
		const activeMapType = this.getMapTypeFromParams();
		const activeMapTypeChanged = this.activeMapType_ !== activeMapType;
		this.activeMapType_ = activeMapType;

		const activeGridType = this.getGridTypeFromParams();
		const activeGridTypeChanged = this.activeGridType_ !== activeGridType;
		this.activeGridType_ = activeGridType;

		const activeNodeId = this.getNodeIdFromParams();
		const activeNodeIdChanged = this.activeNodeId_ !== activeNodeId;
		this.activeNodeId_ = activeNodeId;

		const activeCharacterId = this.getCharacterIdFromParams();
		const activeCharacterIdChanged =
				this.activeCharacterId_ !== activeCharacterId;
		this.activeCharacterId_ = activeCharacterId

		const activeMaterialId = this.getMaterialIdFromParams();
		const activematerialIdChanged =
				this.activeMaterialId_ !== activeMaterialId;
		this.activeMaterialId_ = activeMaterialId;

		const activeTypeId = this.getTypeIdFromParams();
		const activeTypeIdChanged = this.activeTypeId_ !== activeTypeId;
		this.activeTypeId_ = activeTypeId;

		const activeStoryId = this.getStoryIdFromParams();
		const activeStoryIdChanged = this.activeStoryId_ !== activeStoryId;
		this.activeStoryId_ = activeStoryId;

		const activeOverlay = this.getOverlayFromParams();
		const activeOverlayChanged = this.activeOverlay_ !== activeOverlay;
		this.activeOverlay_ = activeOverlay;

		if (!this.activeStoryId_ || activeStoryIdChanged) {
			this.renderedChapterData_ = [];
		}

		if (activeStoryIdChanged || activematerialIdChanged ||
				activeCharacterIdChanged || activeGridTypeChanged) {
			this.focusedNodeId_ = null;
		}

		const activeFilterMap = this.getFilterMapFromParams();
		let activeFilterMapChanged = false;
		for (let pair of activeFilterMap) {
			const param = pair[0];
			if (activeFilterMap.get(param) !== this.activeFilterMap_.get(param)) {
				activeFilterMapChanged = true;
				break;
			}
		}
		this.activeFilterMap_ = activeFilterMap;

		PubSub.publish(ACTIVE_PARAMS_CHANGE_EVENT, new ActiveParamChangeData(
				activeMapTypeChanged,
				activeGridTypeChanged,
				activeNodeIdChanged,
				activeCharacterIdChanged,
				activematerialIdChanged,
				activeTypeIdChanged,
				activeStoryIdChanged,
				activeFilterMapChanged,
				activeOverlayChanged));
	}

	hoverNodeId(nodeId, flyTo, preview) {
		const nodeData = this.getNodeData(nodeId);
		PubSub.publish(HOVER_CHANGE_EVENT, {
			isHovered: true,
			geoId: nodeData.getGeoId(),
			typeId: nodeData.getTypeId(),
			preview: preview,
			flyTo: flyTo
		});
	}

	unhoverNodeId(nodeId, hideOnHover) {
		const nodeData = this.getNodeData(nodeId);
		PubSub.publish(HOVER_CHANGE_EVENT, {
			isHovered: false,
			geoId: nodeData.getGeoId(),
			typeId: nodeData.getTypeId(),
			hideOnHover: hideOnHover
		});
	}

	hover(geoId, typeId, flyTo, preview) {
		PubSub.publish(HOVER_CHANGE_EVENT, {
			isHovered: true,
			geoId: geoId,
			typeId: typeId,
			preview: preview,
			flyTo: flyTo
		});
	}

	unhover(geoId, typeId, hideOnHover) {
		PubSub.publish(HOVER_CHANGE_EVENT, {
			isHovered: false,
			geoId: geoId,
			typeId: typeId,
			hideOnHover: hideOnHover
		});
	}

	setFocusedNodeId(nodeId) {
		if (this.focusedNodeId_ !== nodeId) {
			this.focusedGeoId_ = null;
			this.focusedTypeId_ = null;
			this.focusedNodeId_ = nodeId;
			PubSub.publish(FOCUS_CHANGE_EVENT);
		}
	}

	maybeSetMapLoaded() {
		if (!this.mapLoaded_) {
			this.mapLoaded_ = true;
			this.maybePublishLoadEvent();
		}
	}

	maybeSetGridLoaded() {
		if (!this.gridLoaded_) {
			this.gridLoaded_ = true;
			this.maybePublishLoadEvent();
		}
	}

	maybePublishLoadEvent() {
		if (this.mapLoaded_ && this.gridLoaded_) {
			PubSub.publish(CONTENT_LOADED_EVENT);
		}
	}

	getFocusedNodeId() {
		return this.focusedNodeId_;
	}

	setFocusedTypeId(typeId) {
		if (this.focusedTypeId_ !== typeId) {
			this.focusedNodeId_ = null;
			this.focusedTypeId_ = typeId;
			PubSub.publish(FOCUS_CHANGE_EVENT);
		}
	}

	getFocusedTypeId() {
		return this.focusedTypeId_;
	}

	setFocusedGeoId(geoId) {
		if (this.focusedGeoId_ !== geoId) {
			this.focusedNodeId_ = null;
			this.focusedGeoId_ = geoId;
			PubSub.publish(FOCUS_CHANGE_EVENT);
		}
	}

	getFocusedGeoId() {
		return this.focusedGeoId_;
	}

	appendRenderedChapter(chapterData) {
		this.renderedChapterData_.push(chapterData);
		PubSub.publish(RENDERED_CHAPTER_CHANGE_EVENT, {
			renderedChapters: this.renderedChapterData_
		});
	}

	getRenderedChapters() {
		return this.renderedChapterData_;
	}

	// Active params

	getActiveGridType() {
		return this.activeGridType_;
	}

	getActiveMapType() {
		return this.activeMapType_;
	}

	getActiveNodeId() {
		return this.activeNodeId_;
	}

	getActiveCharacterId() {
		return this.activeCharacterId_;
	}

	getActiveMaterialId() {
		return this.activeMaterialId_;
	}

	getActiveTypeId() {
		return this.activeTypeId_;
	}

	getActiveStoryId() {
		return this.activeStoryId_;
	}

	getActiveFilterMap() {
		return this.activeFilterMap_;
	}

	getActiveOverlay() {
		return this.activeOverlay_;
	}

	hasActiveBreakdown() {
		return this.activeNodeId_ ||
				this.activeCharacterId_ ||
				this.activeMaterialId_ ||
				this.activeTypeId_ ||
				this.activeStoryId_;
	}

	getDataIds() {
		let keys = [];
		keys = keys.concat(Array.from(this.getStories().keys()));
		keys =keys.concat(Array.from(this.getCharacters().keys()));
		keys = keys.concat(Array.from(this.getMaterials().keys()));
		keys = keys.concat(Array.from(this.getNodes().keys()));
		return keys;
	}

	// Handle history

	getMapTypeFromParams() {
		const activeMapType = this.historyManager_.getActiveMap();
		const isValidMapType =
				Object.values(MapTypeEnum).indexOf(activeMapType) > -1;

		let displayMap = true;
		switch(this.getGridTypeFromParams()) {
			case GridTypeEnum.STORY:
				displayMap = !!this.getStoryIdFromParams();
				break;
			case GridTypeEnum.MATERIAL:
				displayMap = !!this.getMaterialIdFromParams();
				break;
			case GridTypeEnum.CHARACTER:
				displayMap = !!this.getCharacterIdFromParams();
				break;
			case GridTypeEnum.ABOUT:
				displayMap = false;
				break;
			default:
				break;
		}

		if (!displayMap) {
			return MapTypeEnum.NONE;
		}	else {
			return isValidMapType ? activeMapType : DEFAULT_MAP_TYPE;
		}
	}

	getGridTypeFromParams() {
		const activeGridType = this.historyManager_.getActiveGrid();
		const isValidGridType =
				Object.values(GridTypeEnum).indexOf(activeGridType) > -1;
		return isValidGridType ? activeGridType : DEFAULT_GRID_TYPE;
	}

	getNodeIdFromParams() {
		const activeNodeId = this.historyManager_.getActiveNode();
		const node = this.nodeMap_.get(activeNodeId);
		return node ? activeNodeId : null;
	}

	getCharacterIdFromParams() {
		const activeCharacterId = this.historyManager_.getActiveCharacter();
		const character = this.characterMap_.get(activeCharacterId);
		return character ? activeCharacterId : null;
	}

	getMaterialIdFromParams() {
		const activeMaterialId = this.historyManager_.getActiveMaterial();
		const materialData = this.materialMap_.get(activeMaterialId);
		return materialData ? activeMaterialId : null;
	}

	getStoryIdFromParams() {
		const activeStoryId = this.historyManager_.getActiveStory();
		const story = this.storyMap_.get(activeStoryId);
		return story ? activeStoryId : null;
	}

	getTypeIdFromParams() {
		const activeTypeId = this.historyManager_.getActiveType();
		const type = this.typeMap_.get(activeTypeId);
		return type ? activeTypeId : null;
	}

	getFilterMapFromParams() {
		return this.historyManager_.getActiveFilterMap();
	}

	getOverlayFromParams() {
		return this.historyManager_.getActiveOverlay();
	}
}

export default ContentManager;
