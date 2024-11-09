/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.toml`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */
import { Client } from '@neondatabase/serverless';

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		return new Response(`Hello world!`);
	},

	async scheduled(event: ScheduledController, env: Env, ctx: ExecutionContext) {
		try {
			const client = new Client(env.DATABASE_URL);
			await client.connect();

			// Insert a new note
			const insertResult = await client.query(
				'INSERT INTO "Note" (id, note, "createdAt", "updatedAt") VALUES (gen_random_uuid(), $1, NOW(), NOW()) RETURNING id',
				['Test note from scheduled job']
			);
			const noteId = insertResult.rows[0].id;
			console.log(`Created note with ID: ${noteId}`);

			// Delete the note
			await client.query('DELETE FROM "Note" WHERE id = $1', [noteId]);
			console.log(`Deleted note with ID: ${noteId}`);

			await client.end();
		} catch (error) {
			console.error('Error in scheduled job:', error);
		}
	},
} satisfies ExportedHandler<Env>;
