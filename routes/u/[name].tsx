import type { Handlers, PageProps } from "$fresh/server.ts";
import {
	authHandler,
	AuthHandlerAnyoneCookieData,
	findUserFromId,
	findUserIdFromName,
	User,
} from "database";
import Header from "@/components/ui/Header.tsx";

interface UserPageProps extends AuthHandlerAnyoneCookieData {
	searchedUser?: User;
}

export const handler: Handlers = {
	...authHandler(undefined, undefined, async (_, ctx) => {
		const { name } = ctx.params;
		const id = await findUserIdFromName(name);
		if (id == undefined) return { user: undefined };
		const user = (await findUserFromId(id))!;
		return {
			searchedUser: {
				...user,
				password: undefined,
				token: undefined,
			},
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
