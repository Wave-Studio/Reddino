import { AppProps } from "$fresh/server.ts";
import { Head } from "$fresh/runtime.ts";

export default function App({ Component }: AppProps) {
	return (
		<>
			<Head>
				<title>Reddino</title>
				{/* So that it doesn't look garbage while developing */}
				<style>
					{`
					body {
						background-color: #333;
						color: white;
					}

					input, textarea {
						background-color: #444;
						color: white;
					}
				`}
				</style>
				<meta property="og:site_name" content="Wave Studios" />
				<meta property="og:title" content="Reddino" />
				<meta property="og:type" content="website" />
				<meta property="og:image" content="favicon.ico" />
				<meta
					property="og:description"
					content="A reddit-like website made for the Deno Kv 2023 Hackathon"
				/>
				<meta name="theme-color" content="#1d7bd8" />
			</Head>
			<Component />
		</>
	);
}
