import $ from 'jquery';
import React, { Component } from 'react';

class Chapter extends Component {
	constructor(props) {
		super(props)
		this.contentManager_ = props.contentManager;
		this.chapterManager_ = props.chapterManager;
		this.chapterData_ = this.chapterManager_.getChapterData(props.id);
	}

	componentDidMount() {
		this.addDecisionHovers();
	}

	addDecisionHovers() {
		const decisions = this.chapterData_.getDecisions();

		const thisChapter = this;
		const chapterId = "chapter-" + this.chapterData_.getId();
		$(`#${chapterId}`).find(".decision").each(function(index) {
			const chapterData = thisChapter.chapterManager_.getChapterData(
					decisions[index].getChapterId());

			let typeId = null;
			let geoId = null;
			if (chapterData.getNodeId()) {
				const nodeData = thisChapter.contentManager_.getNodeData(
						chapterData.getNodeId());
				typeId = (nodeData && nodeData.getTypeId()) || null;
				geoId = (nodeData && nodeData.getGeoId()) || null;
			} else {
				let typeId = chapterData ? chapterData.getTypeId() : null;
				let geoId = chapterData ? chapterData.getGeoId() : null;
			}

			$(this).hover(function() {
				thisChapter.contentManager_.hover(
						geoId, typeId, false /* flyTo */, true /* preview */);
			}, function() {
				let hideOnHover = true;
				const renderedGeoIds = thisChapter.chapterManager_.getRenderedGeoIds();
				hideOnHover = !renderedGeoIds.includes(geoId);
				thisChapter.contentManager_.unhover(geoId, typeId, hideOnHover);
			});
		});
	}

	render() {
		let decisions = [];
		for (let i = 0; i < this.chapterData_.getDecisions().length; i++) {
			if (!this.chapterManager_.showDecisions(this.chapterData_.getId())) {
				break;
			}
			const decisionData = this.chapterData_.getDecisions()[i];
			decisions.push(
				<div
						className="decision"
						onClick={(e) => {
						  e.stopPropagation();
						  const chapterId = decisionData.getChapterId();
						  const chapterData =
						  		this.chapterManager_.getChapterData(chapterId);
							const nodeId = chapterData ? chapterData.getNodeId() : null;
						  this.contentManager_.unhoverNodeId(nodeId);
							this.chapterManager_.addRenderedChapterId(chapterId);
						}}>
					{decisionData.getText()}
				</div>
			)
		}
		return (
			<div
					className="chapter"
					id={"chapter-" + this.chapterData_.getId()}
					hover
					onClick={() => {
						this.chapterManager_.setFocusedChapterId(
								this.chapterData_.getId());
					}}>
				<div>
					{this.chapterData_.getId()} <br/>
					{this.chapterData_.getText()} <br/>
					{decisions}
				</div>
			</div>
		);
	}
}

export default Chapter;

