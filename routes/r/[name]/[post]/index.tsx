import { Handlers, PageProps } from "$fresh/server.ts";
import {
	authHandler,
	findUserFromId,
	Post,
	getPost,
	UserWithoutAuth,
	User,
} from "database";
import Header from "@/components/ui/Header.tsx";

type PostProps =
	| { post: undefined; author: undefined; user?: User }
	| {
			post: Post;
			author: UserWithoutAuth;
			user?: User;
	  };

export const handler: Handlers = {
	...authHandler(undefined, undefined, async (req, ctx) => {
		const { name, post } = ctx.params;
		const postData = await getPost(name, post);

		if (postData != undefined) {
			const author = (await findUserFromId(postData.authorId))!;

			return {
				post: postData,
				author: {
					...author,
					password: undefined,
					token: undefined,
				},
			};
		} else {
			return {
				post: undefined,
			};
		}
	}),
};

export default function Post({ data }: PageProps<PostProps>) {
	return (
		<>
			<Header user={data.user} />
			{data.post != undefined ? (
				<>
					<div>
						<h1>
							<a>
								{data.author.nickname != undefined
									? `${data.author.nickname} (${data.author.name})`
									: data.author.name}
							</a>{" "}
							- {data.post.title}
						</h1>
						<h2>
							Posted:{" "}
							{new Intl.DateTimeFormat("en-US", {
								dateStyle: "full",
							}).format(data.post.createdAt)}
						</h2>
						<p>{data.post.content}</p>
					</div>
				</>
			) : (
				<>
					<p>Unknown post</p>
				</>
			)}
		</>
	);
}
