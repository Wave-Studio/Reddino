import {
	authHandler,
	AuthHandlerUserCookieData,
	createPost,
	getSub,
	isUserLoggedIn,
} from "database";
import Header from "@/components/ui/Header.tsx";
import { Handlers, PageProps } from "$fresh/server.ts";
import { Head } from "$fresh/runtime.ts";
import { getCookies } from "$std/http/cookie.ts";

interface SubPostProps extends AuthHandlerUserCookieData {
	sub?: string;
	error?: string;
	postID?: string;
}

export const handler: Handlers = {
	...authHandler(undefined, "/auth/login", async (req, ctx) => {
		const { name } = ctx.params;
		const sub = await getSub(name.toLowerCase().trim());
		return {
			sub: sub != undefined ? sub.name : undefined,
		};
	}),
	async POST(req, ctx) {
		const data = await req.formData();
		const sessionUser = await isUserLoggedIn(getCookies(req.headers));
		const { name } = ctx.params;
		const sub = await getSub(name.toLowerCase().trim());

		if (!sessionUser.loggedIn) {
			return await ctx.render({
				sub: undefined,
				error: "You must be logged in to post",
			});
		}

		if (sub == undefined) {
			return await ctx.render({
				sub: undefined,
				error: "Unknown sub",
			});
		}

		const title = data.get("title");
		const content = data.get("content");

		if (title == undefined) {
			return await ctx.render({
				sub: sub.name,
				error: "Title is required",
			});
		}

		if (content == undefined) {
			return await ctx.render({
				sub: sub.name,
				error: "Content is required",
			});
		}

		if (title.toString().trim().length > 100) {
			return await ctx.render({
				sub: sub.name,
				error: "Title must be shorter than 100 characters",
			});
		}

		if (content.toString().trim().length > 10000) {
			return await ctx.render({
				sub: sub.name,
				error: "Content must be shorter than 10000 characters",
			});
		}

		if (title.toString().trim().length < 5) {
			return await ctx.render({
				sub: sub.name,
				error: "Title must be at least 5 characters",
			});
		}

		if (content.toString().trim().length < 10) {
			return await ctx.render({
				sub: sub.name,
				error: "Content must be at least 10 characters",
			});
		}

		const post = await createPost({
			title: title.toString().trim(),
			content: content.toString().trim(),
			authorId: sessionUser.user.id,
			subName: sub.name,
		});

		if (post.created) {
			return await ctx.render({
				sub: sub.name,
				postID: post.id,
			});
		} else {
			return await ctx.render({
				sub: sub.name,
				error: post.reason,
			});
		}
	},
};

export default function SubHomepage({ data }: PageProps<SubPostProps>) {
	return (
		<>
			<Header user={data.user} />
			{data.postID != undefined
				? (
					<>
						<Head>
							<meta
								http-equiv="refresh"
								content={`0; url=/r/${data
									.sub!}/${data.postID}`}
							/>
						</Head>
						<p>
							Redirecting to{" "}
							<a href={`/r/${data.sub!}/${data.postID}`}>
								/r/{data.sub!}/{data.postID}
							</a>
						</p>
					</>
				)
				: (
					<>
						<div>
							{data.sub != undefined
								? (
									<>
										<form
											method="post"
											class="flex flex-col w-[20%] items-center"
										>
											{data.error != undefined
												? <p>{data.error}</p>
												: <></>}
											<input
												name="title"
												type="text"
												placeholder="Title"
												class="mb-2 px-2 py-1"
												required
											/>
											<textarea
												name="content"
												type="textarea"
												placeholder="Content"
												class="mb-2 px-2 py-1"
												required
											/>
											<button
												type="submit"
												class="bg-black px-4 py-2 w-[45%] rounded-lg"
											>
												Post
											</button>
										</form>
									</>
								)
								: (
									<>
										<p>Unknown sub</p>
									</>
								)}
						</div>
					</>
				)}
		</>
	);
}
