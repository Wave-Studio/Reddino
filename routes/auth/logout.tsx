import { PageProps } from "$fresh/server.ts";
import { authHandler } from "database";
import Header from "@/components/ui/Header.tsx";

export const handler = authHandler(undefined, "/auth/login");

export default function Logout({ data }: PageProps) {
	return (
		<>
			<Header user={data.user} />
		</>
	);
}
