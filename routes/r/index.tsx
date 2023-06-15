import { PageProps } from "$fresh/server.ts";
import { authHandler, kv, Sub } from "database";
import Header from "@/components/ui/Header.tsx";

interface SubHomeProps {
	subs: string[];
}

export const handler = authHandler(undefined, undefined, async (req, ctx) => {
	const subs = [];

	for await (const sub of kv.list<Sub>({ prefix: ["sub"] })) {
		if (sub.key.length > 2) continue;
		subs.push(sub.value.name);
	}

	return {
		subs,
	};
});

export default function SubHome({ data }: PageProps<SubHomeProps>) {
	return (
		<>
			<Header />
			<div className="flex flex-col">
				<h1>Subs</h1>
				{data.subs.map((sub) => (
					<>
						<a href={`/r/${sub}`}>r/{sub}</a>
					</>
				))}
			</div>
		</>
	);
}
