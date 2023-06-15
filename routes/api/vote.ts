import { Handlers } from "$fresh/server.ts";
import { getCookies } from "$std/http/cookie.ts";
import { downvote, isUserLoggedIn, unvote, upvote } from "database/index.ts";

export const handler: Handlers = {
	GET() {
		return new Response("Unsupported", {
			headers: {
				Location: "https://http.cat/images/400.jpg",
			},
			status: 400,
		});
	},
	async POST(req) {
		const user = await isUserLoggedIn(getCookies(req.headers));
		if (!user.loggedIn) {
			return new Response("Unauthorized", {
				status: 401,
			});
		}
		const url = new URL(req.url);
		const voteType = url.searchParams.get("voteType");
		const subName = url.searchParams.get("subName");
		const postId = url.searchParams.get("postId");

		if (
			voteType == undefined || subName == undefined || postId == undefined
		) {
			return new Response("Bad Request", {
				status: 400,
			});
		}

		switch (voteType) {
			case "upvote": {
				const status = await upvote(user.user.id, {
					sub: subName,
					post: postId,
				});
				if (status.voted) {
					return new Response("OK", {
						status: 200,
					});
				} else {
					return new Response(JSON.stringify(status), {
						status: 400,
					});
				}
			}

			case "downvote": {
				const status = await downvote(user.user.id, {
					sub: subName,
					post: postId,
				});
				if (status.voted) {
					return new Response("OK", {
						status: 200,
					});
				} else {
					return new Response(JSON.stringify(status), {
						status: 400,
					});
				}
			}

			case "unvote": {
				const status = await unvote(user.user.id, {
					sub: subName,
					post: postId,
				});
				if (status.voted) {
					return new Response("OK", {
						status: 200,
					});
				} else {
					return new Response(JSON.stringify(status), {
						status: 400,
					});
				}
			}

			default: {
				return new Response("Bad Request", {
					status: 400,
				});
			}
		}
	},
};
