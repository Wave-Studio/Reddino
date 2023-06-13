import type { Handlers, PageProps } from "$fresh/server.ts";
import {
	authHandler,
	AuthHandlerAnyoneCookieData,
	findUserFromId,
	findUserIdFromName,
} from "database";
import Header from "@/components/ui/Header.tsx";

export const handler: Handlers = {
	...authHandler(undefined, undefined, async (_, ctx) => {
		const { name } = ctx.params;
		const id = await findUserIdFromName(name);
		if (id == undefined) return { user: undefined };
		const user = (await findUserFromId(id))!;
		return {
			user: {
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

export default function UserPage({ data }: PageProps<AuthHandlerAnyoneCookieData>) {
	return (
		<>
			<div>
				<Header user={data.user} />
				<div>
					{data.user != undefined
						? (
							<>
								<p>
									User: {data.user.nickname != undefined
										? `${data.user.nickname} (${data.user.name})`
										: data.user.name}
								</p>
								<p>
									Joined: {new Intl.DateTimeFormat("en-US", {
										dateStyle: "full",
									})
										.format(
											data.user.joined,
										)}
								</p>
								<p>Admin: {data.user.admin ? "Yes" : "No"}</p>
							</>
						)
						: (
							<>
								<p>Unknown user</p>
							</>
						)}
				</div>
			</div>
		</>
	);
}
