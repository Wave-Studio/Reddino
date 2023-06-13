import { UnknownPageProps } from "$fresh/server.ts";
import Header from "@/components/ui/Header.tsx";

export default function NotFoundPage({ url }: UnknownPageProps) {
	return (
		<>
			<Header />
			<p>404 not found: {url.pathname}</p>
		</>
	);
}
