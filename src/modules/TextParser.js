import React from 'react';

const EmbedTypeEnum = {
	IMAGE: 'image',
	VIDEO: 'video',
	LINK: 'link',
	NEWLINE: 'newline',
};

class TextParser {

	static parseText(text, className, imageMap) {
		let elements = [];
		let textSoFar = "";

		const embedExpression = /{.*?}/;
		for (let matchArray = text.match(embedExpression); matchArray !== null;
				matchArray = text.match(embedExpression)) {
			const subText = text.substring(0, matchArray.index);
			textSoFar += subText;
			text = text.replace(subText, '');

			const embed = matchArray[0];
			text = text.replace(embed, '');

			const typeExpression = /type=([^\s|}]+)/;
			const typeMatch = embed.match(typeExpression);
			const type = (typeMatch && typeMatch[1]) || null;

			const infoExpression = /info=([^\s|}]+)/;
			const infoMatch = embed.match(infoExpression);
			const info = (infoMatch && infoMatch[1]) || null;

			if (!type || !info) {
				continue;
			}

			const textExpression = /text=([^\s|}]+)/;
			const textatch = embed.match(textExpression);
			const innerText = (textatch && textatch[1]) || null;

			switch (typeMatch[1]) {
				case EmbedTypeEnum.IMAGE:
					if (!imageMap || !imageMap.get(info)) {
						continue;
					}
					elements.push(
						<div className={`${className}_text`}>
							{textSoFar}
						</div>
					);
					elements.push(
						<img
								className={`${className}_image`}
								src={imageMap.get(info)} />
					);
					break;

				case EmbedTypeEnum.VIDEO:
					const videoParams =
							"?rel=&wmode=Opaque&enablejsapi=1;showinfo=0;controls=0";
					elements.push(
						<div className={`${className}_text`}>
							{textSoFar}
						</div>
					);
					elements.push(
						<iframe src={info + videoParams} className={`${className}_video`}/>
					);
					break;

				case EmbedTypeEnum.LINK:
					if (!innerText) {
						continue;
					}

					elements.push(
						<div className={`${className}_text`}>
							{textSoFar}
						</div>
					);
					elements.push(
						<a href={info} className={`${className}_link`} target="blank">
							{innerText}
						</a>
					);
					break;

				case EmbedTypeEnum.NEWLINE:
					const newlineCount = parseInt(info);
					if (!newlineCount) {
						continue;
					}

					elements.push(
						<div className={`${className}_text`}>
							{textSoFar}
						</div>
					);
					for (let i = 0; i < newlineCount; i++) {
						elements.push(
							<br/>
						);
					}
					break;

				default:
					continue;
			}
			textSoFar = '';
		}
		elements.push(
			<div className = {`text_${className}`}>
				{textSoFar+text}
			</div>
		)
		return elements;
	}
}

export default TextParser;

