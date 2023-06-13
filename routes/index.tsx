import type { Handlers, PageProps } from "$fresh/server.ts";
import { authHandler, AuthHandlerAnyoneCookieData } from "database";
import Header from "@/components/ui/Header.tsx";

export const handler: Handlers = {
	...authHandler(),
	async POST(req, ctx) {
		// Fix 405 error from logging in
		return await authHandler().GET!(req, ctx);
	},
};

export default function Home({ data }: PageProps<AuthHandlerAnyoneCookieData>) {
	return (
		<>
			<div>
				<Header user={data.user} />
				<div>
					You currently {data.user != undefined ? "are" : "are not"}
					{" "}
					logged in.
				</div>
			</div>
		</>
	);
}
