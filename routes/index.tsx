import type { Handlers, PageProps } from "$fresh/server.ts";
import {
	authHandler,
	AuthHandlerAnyoneCookieData,
	getPosts,
	PostWithUser,
} from "database";
import Header from "@/components/ui/Header.tsx";
import PostList from "@/components/ui/PostList.tsx";

interface HomeProps extends AuthHandlerAnyoneCookieData {
	posts: PostWithUser[];
}

export const handler: Handlers = {
	...authHandler(undefined, undefined, async (req, ctx) => {
		const posts = await getPosts();
		return { posts };
	}),
	async POST(req, ctx) {
		// Fix 405 error from logging in
		return await authHandler().GET!(req, ctx);
	},
};

export default function Home({ data }: PageProps<HomeProps>) {
	return (
		<>
			<div>
				<Header user={data.user} />
				<div>
					You currently {data.user != undefined ? "are" : "are not"} logged in.
				</div>
				<div>
					{data.posts.map((p) => (
						<>
							<PostList post={p} />
						</>
					))}
				</div>
			</div>
		</>
	);
}
