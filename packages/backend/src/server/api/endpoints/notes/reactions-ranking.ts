/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Inject, Injectable } from '@nestjs/common';
import type { NoteReactionsRepository } from '@/models/_.js';
import { Endpoint } from '@/server/api/endpoint-base.js';
import { DI } from '@/di-symbols.js';
import { IdService } from '@/core/IdService.js';

export const meta = {
	tags: ['reactions', 'notes'],

	requireCredential: false,

	allowGet: true,
	cacheSec: 60,

	res: {
		type: 'array',
		optional: false, nullable: false,
		items: {
			type: 'object',
			optional: false, nullable: false,
			properties: {
				reaction: {
					type: 'string',
					optional: false, nullable: false,
				},
				count: {
					type: 'number',
					optional: false, nullable: false,
				},
			},
		},
	},
} as const;

export const paramDef = {
	type: 'object',
	properties: {
		limit: { type: 'integer', minimum: 1, maximum: 50, default: 10 },
		period: { type: 'string', enum: ['all', '1h', '24h', '7d', '30d'], default: 'all' },
	},
	required: [],
} as const;

@Injectable()
export default class extends Endpoint<typeof meta, typeof paramDef> { // eslint-disable-line import/no-default-export
	constructor(
		@Inject(DI.noteReactionsRepository)
		private noteReactionsRepository: NoteReactionsRepository,

		private idService: IdService,
	) {
		super(meta, paramDef, async (ps) => {
			const query = this.noteReactionsRepository.createQueryBuilder('reaction')
				.select('reaction.reaction', 'reaction')
				.addSelect('COUNT(*)', 'count')
				.groupBy('reaction.reaction')
				.orderBy('count', 'DESC')
				.limit(ps.limit);

			if (ps.period !== 'all') {
				const msMap = {
					'1h': 1000 * 60 * 60,
					'24h': 1000 * 60 * 60 * 24,
					'7d': 1000 * 60 * 60 * 24 * 7,
					'30d': 1000 * 60 * 60 * 24 * 30,
				} as const;
				const sinceDate = new Date(Date.now() - msMap[ps.period]);
				const sinceId = this.idService.gen(sinceDate.getTime());
				query.andWhere('reaction.id > :sinceId', { sinceId });
			}

			const rows = await query.getRawMany<{ reaction: string; count: string }>();
			return rows.map(r => ({ reaction: r.reaction, count: parseInt(r.count, 10) }));
		});
	}
}
