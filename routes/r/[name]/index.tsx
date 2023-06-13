import {
	authHandler,
	AuthHandlerAnyoneCookieData,
	findUserFromId,
	getSub,
	Sub,
	User,
	UserWithoutAuth,
} from "database";
import Header from "@/components/ui/Header.tsx";
import { Handlers, PageProps } from "$fresh/server.ts";

interface DataSub extends Sub {
	owner: UserWithoutAuth;
	mods: UserWithoutAuth[];
}

interface SubHomepageProps extends AuthHandlerAnyoneCookieData {
	sub?: DataSub;
}

export const handler: Handlers = {
	...authHandler(undefined, undefined, async (req, ctx) => {
		const { name } = ctx.params;
		const sub = await getSub(name);

		if (sub == undefined) {
			return { sub: undefined };
		} else {
			const owner = {
				...(await findUserFromId(sub.ownerId))!,
				password: undefined,
				token: undefined,
			};
			const mods: UserWithoutAuth[] = [];

			for (const modId of sub.modIds) {
				const modData = await findUserFromId(modId);
				if (modData != undefined) {
					mods.push({
						...modData,
						password: undefined,
						token: undefined,
					} as UserWithoutAuth);
				}
			}

			return {
				sub: {
					...sub,
					owner,
					mods,
				},
			};
		}
	}),
};

export default function SubHomepage({ data }: PageProps<SubHomepageProps>) {
	return (
		<>
			<Header user={data.user} />
			<div>
				{data.sub != undefined ? (
					<>
						<p>Sub: {data.sub.name}</p>
						<p>Owner: {data.sub.owner.name}</p>
						<p>Moderators: {data.sub.mods.map((mod) => mod.name).join(", ")}</p>
						<p>
							Created:{" "}
							{new Intl.DateTimeFormat("en-US", {
								dateStyle: "full",
							}).format(data.sub.created)}
						</p>
						<p>
							Description: {data.sub.description ?? "No description provided"}
						</p>
					</>
				) : (
					<>
						<p>Unknown sub</p>
					</>
				)}
			</div>
		</>
	);
}
