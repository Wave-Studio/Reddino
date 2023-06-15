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
						background-color: #111827;
						color: #e5e7eb;
					}

					input, textarea {
						background-color: #111827;
						color: white;
						border-radius: 0.5rem;
						padding-top: 0.5rem !important;
						padding-bottom: 0.5rem !important;
					}
					input, textarea:focus {
						outline: none
					}
				`}
        </style>
        <meta property="og:site_name" content="Wave Studios" />
        <meta property="og:title" content="Reddino" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="favicon.ico" />
        <meta
          property="og:description"
          content="A reddit-like website made for the 2023 Deno Kv Hackathon"
        />
        <meta name="theme-color" content="#1d7bd8" />
      </Head>
      <div className="flex flex-col">
        <Component />
      </div>
    </>
  );
}
