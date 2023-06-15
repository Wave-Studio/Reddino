import { Handlers, PageProps } from "$fresh/server.ts";
import {
	authHandler,
	findUserFromId,
	getPost,
	hasUserDownvoted,
	hasUserUpvoted,
	isUserLoggedIn,
	Post,
	User,
	UserWithoutAuth,
} from "database";
import Header from "@/components/ui/Header.tsx";
import VoteUI from "@/islands/VoteUI.tsx";
import { getCookies } from "$std/http/cookie.ts";

interface VoteData {
	upvoted: boolean;
	downvoted: boolean;
}

type PostProps =
	| { post: undefined; author: undefined; user?: User; voteData: undefined }
	| {
		post: Post;
		author: UserWithoutAuth;
		user?: User;
		voteData: VoteData;
	};

export const handler: Handlers = {
	...authHandler(undefined, undefined, async (req, ctx) => {
		const { name, post } = ctx.params;
		const postData = await getPost(name, post);
		const sessionUser = await isUserLoggedIn(getCookies(req.headers));

		if (postData != undefined) {
			const author = (await findUserFromId(postData.authorId))!;
			const voteData = {
				upvoted: false,
				downvoted: false,
			};

			if (sessionUser.loggedIn) {
				const upvoted = await hasUserUpvoted(sessionUser.user.id, {
					sub: postData.subName,
					post: postData.id,
				});
				const downvoted = await hasUserDownvoted(sessionUser.user.id, {
					sub: postData.subName,
					post: postData.id,
				});

				voteData.upvoted = upvoted;
				voteData.downvoted = downvoted;
			}

			return {
				post: postData,
				author: {
					...author,
					password: undefined,
					token: undefined,
				},
				voteData,
			};
		} else {
			return {
				post: undefined,
				author: undefined,
				voteData: undefined,
			};
		}
	}),
};

export default function Post({ data }: PageProps<PostProps>) {
	return (
		<>
			<Header user={data.user} />
			{data.post != undefined
				? (
					<>
						<div>
							<VoteUI
								currentVotes={data.post.votes ?? 0}
								postInfo={{
									post: data.post.id,
									sub: data.post.subName,
								}}
								userId={data.user?.id ?? undefined}
								hasUserDownvoted={data.voteData?.downvoted ??
									false}
								hasUserUpvoted={data.voteData?.upvoted ?? false}
							/>
							<h1>
								<a>
									{data.author.nickname != undefined
										? `${data.author.nickname} (${data.author.name})`
										: data.author.name}
								</a>{" "}
								- {data.post.title}
							</h1>
							<h2>
								Posted: {new Intl.DateTimeFormat("en-US", {
									dateStyle: "full",
								}).format(data.post.createdAt)}
							</h2>
							<p>{data.post.content}</p>
						</div>
					</>
				)
				: (
					<>
						<p>Unknown post</p>
					</>
				)}
		</>
	);
}
