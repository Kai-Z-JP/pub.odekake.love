/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export function nyaize(text: string): string {
	// ja-JP
	return text
		.replaceAll('な', 'にゃ')
		.replaceAll('ナ', 'ニャ')
		.replaceAll('ﾅ', 'ﾆｬ')

	// en-US
		.replace(/na/gi, x => x === 'NA' ? 'NYA' : 'nya')
		.replace(/(morn)(ing)/gi, (_, morn, ing) => morn + (ing === 'ING' ? 'YAN' : 'yan'))
		.replace(/(every)(one)/gi, (_, every, one) => every + (one === 'ONE' ? 'NYAN' : 'nyan'))

	// ko-KR
		.replace(/[나-낳]/g, match => String.fromCharCode(
			match.charCodeAt(0)! + '냐'.charCodeAt(0) - '나'.charCodeAt(0),
		))
		.replace(/다[\. ]|다$|다!|다\?/gm, '다냥')
		.replace(/야[ ?]|야$/gm, '냥');
}
