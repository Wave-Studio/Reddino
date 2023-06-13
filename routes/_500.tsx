import { ErrorPageProps } from "$fresh/server.ts";
import Header from "@/components/ui/Header.tsx";

export default function Error500Page({ error }: ErrorPageProps) {
	return (
		<>
			<Header />
			<p>500 internal error: {(error as Error).message}</p>
		</>
	);
}
