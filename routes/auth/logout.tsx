import { Handlers } from "$fresh/server.ts";
import { setCookie } from "$std/http/cookie.ts";

export const handler: Handlers = {
	GET() {
		const resp = new Response("Redirecting...", {
			headers: {
				Location: "/",
			},
			status: 307,
		});
		setCookie(resp.headers, {
			name: "token",
			value: "",
			path: "/",
			expires: Date.now() + 30 * 24 * 60 * 1000,
		});
		return resp;
	},
};
