import { authHandler, AuthHandlerAnyoneCookieData } from "database";
import { PageProps } from "$fresh/server.ts";
import Header from "@/components/ui/Header.tsx";

export const handler = authHandler();

export default function UserList({
	data,
}: PageProps<AuthHandlerAnyoneCookieData>) {
	return (
		<>
			<Header user={data.user} />
			<h1>Soon:tm:</h1>
		</>
	);
}
