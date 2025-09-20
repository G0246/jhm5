/**
 * TicTacToe Game Cloudflare Worker
 * Serves static files from the public directory
 */

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		// Get the URL path from the request
		const url = new URL(request.url);

		// Error handling for missing ASSETS binding
		try {
			const asset = await env.ASSETS.fetch(new Request(url, request));
			return asset;
		} catch (error) {
			// If asset not found, return 404
			return new Response('Not Found', { status: 404 });
		}
	},
} satisfies ExportedHandler<Env>;
