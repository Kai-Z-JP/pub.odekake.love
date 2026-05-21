/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export class MultipleReactionsPerNote1779344623603 {
    name = 'MultipleReactionsPerNote1779344623603'

    async up(queryRunner) {
        // Drop the old unique index on (userId, noteId)
        await queryRunner.query(`DROP INDEX "public"."IDX_ad0c221b25672daf2df320a817"`);
        // Add a non-unique index on (userId, noteId) for query performance
        await queryRunner.query(`CREATE INDEX "IDX_note_reaction_userId_noteId" ON "note_reaction" ("userId", "noteId")`);
        // Add a new unique index on (userId, noteId, reaction) to allow multiple emoji per user per note
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_note_reaction_userId_noteId_reaction" ON "note_reaction" ("userId", "noteId", "reaction")`);
    }

    async down(queryRunner) {
        await queryRunner.query(`DROP INDEX "public"."IDX_note_reaction_userId_noteId_reaction"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_note_reaction_userId_noteId"`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_ad0c221b25672daf2df320a817" ON "note_reaction" ("userId", "noteId")`);
    }
}
