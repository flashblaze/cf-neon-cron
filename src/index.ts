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
		console.log('Running scheduled database check...');

		try {
			const client = new Client(env.DATABASE_URL);
			await client.connect();
			const { rows } = await client.query('SELECT COUNT(*) FROM "Note";');
			console.log(`Scheduled check - Total records: ${rows[0].count}`);
			await client.end();
		} catch (error) {
			console.error('Error in scheduled job:', error);
		}
	},
} satisfies ExportedHandler<Env>;
