class ChapterData {
	constructor(chapterObject) {
		this.id_ = chapterObject.id;
		this.nodeId_ = chapterObject.nodeId || null;
		this.geoId_ = chapterObject.geoId || null;
		this.typeId_ = chapterObject.typeId || null;
		this.sourceId_ = chapterObject.sourceId || null;
		this.text_ = chapterObject.text || "";

		this.decisions_ = [];
		for (let i = 0; i < chapterObject.decisions.length; i++) {
			this.decisions_.push(new DecisionData(chapterObject.decisions[i]));
		}
	}

	getId() {
		return this.id_;
	}

	getNodeId() {
		return this.nodeId_;
	}

	getGeoId() {
		return this.geoId_;
	}

	getTypeId() {
		return this.typeId_;
	}

	getSourceId() {
		return this.sourceId_;
	}

	getCharacterId() {
		return this.characterId_;
	}

	getText() {
		return this.text_;
	}

	getDecisions() {
		return this.decisions_;
	}
}

class DecisionData {
	constructor(decisionObject) {
		this.chapterId_ = decisionObject.chapterId;
		this.text_ = decisionObject.text;
	}

	getChapterId() {
		return this.chapterId_;
	}

	getText() {
		return this.text_;
	}
}

export default ChapterData;
