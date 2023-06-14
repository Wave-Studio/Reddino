import type { Handlers, PageProps } from "$fresh/server.ts";
import {
	authHandler,
	AuthHandlerAnyoneCookieData,
	findUserFromId,
	findUserIdFromName,
	PostWithUser,
	User,
} from "database";
import Header from "@/components/ui/Header.tsx";
import PostList from "@/components/ui/PostList.tsx";

interface UserPageProps extends AuthHandlerAnyoneCookieData {
	searchedUser?: User;
	posts: PostWithUser[];
}

export const handler: Handlers = {
	...authHandler(undefined, undefined, async (_, ctx) => {
		const { name } = ctx.params;
		const id = await findUserIdFromName(name);
		if (id == undefined) return { searchedUser: undefined, posts: [] };
		const user = (await findUserFromId(id))!;
		return {
			searchedUser: {
				...user,
				password: undefined,
				token: undefined,
			},
			posts: [],
		};
	}),
	async POST(req, ctx) {
		// Fix 405 error from logging in
		return await authHandler().GET!(req, ctx);
	},
};

export default function UserPage({ data }: PageProps<UserPageProps>) {
	return (
		<>
			<div>
				<Header user={data.user} />
				<div>
					{data.searchedUser != undefined ? (
						<>
							<p>
								User:{" "}
								{data.searchedUser.nickname != undefined
									? `${data.searchedUser.nickname} (${data.searchedUser.name})`
									: data.searchedUser.name}
							</p>
							<p>
								Joined:{" "}
								{new Intl.DateTimeFormat("en-US", {
									dateStyle: "full",
								}).format(data.searchedUser.joined)}
							</p>
							<p>Admin: {data.searchedUser.admin ? "Yes" : "No"}</p>
							<div>
								{data.posts.map((p) => (
									<>
										<PostList post={p} />
									</>
								))}
							</div>
						</>
					) : (
						<>
							<p>Unknown user</p>
						</>
					)}
				</div>
			</div>
		</>
	);
}
