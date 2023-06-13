import type { UserWithoutAuth } from "database";
import { Head } from "$fresh/runtime.ts";

export default function Header({ user }: { user?: UserWithoutAuth }) {
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

					input {
						background-color: #444;
						color: white;
					}
				`}
				</style>
			</Head>
			<div class="flex justify-between p-2 bg-[#222]">
				<a href="/">Reddino</a>
				<div>
					{user != undefined
						? (
							<>
								<a href={`/u/${user.name}`} class="mr-3">
									{user.name}
								</a>
								<a href="/auth/logout">Logout</a>
							</>
						)
						: (
							<>
								<a href="/auth/login">Login</a>
							</>
						)}
				</div>
			</div>
		</>
	);
}
