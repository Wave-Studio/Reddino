import { Handlers, PageProps } from "$fresh/server.ts";
import { authHandler, loginUser } from "database";
import Header from "@/components/ui/Header.tsx";
import { setCookie } from "$std/http/cookie.ts";

export const handler: Handlers = {
	...authHandler("/"),
	async POST(req, ctx) {
		const form = await req.formData();
		const username = form.get("username");
		const password = form.get("password");
		if (username == null || password == null) {
			return ctx.render({
				errorMessage: "Invalid username or password",
			});
		}

		const loggedInUser = await loginUser(
			username.toString(),
			password.toString()
		);
		if (loggedInUser.loggedIn == false) {
			return ctx.render({
				errorMessage: loggedInUser.error,
			});
		} else {
			const resp = new Response("Redirecting...", {
				headers: {
					Location: "/",
				},
				status: 307,
			});
			setCookie(resp.headers, {
				name: "token",
				value: loggedInUser.user.token,
				path: "/",
				expires: Date.now() + 30 * 24 * 60 * 1000
			});
			return resp;
		}
	},
};

export default function Login({ data }: PageProps) {
	return (
		<>
			<Header user={data.user} />
			<div class="flex flex-col items-center">
				<h1>Login</h1>
				{data.errorMessage != undefined ? (
					<>
						<p>{data.errorMessage}</p>
					</>
				) : (
					<></>
				)}
				<form method="post" class="flex flex-col w-[20%] items-center">
					<input
						type="text"
						name="username"
						placeholder="Username"
						class="mb-2 px-2 py-1"
						required
					/>
					<input
						type="password"
						name="password"
						placeholder="Password"
						class="mb-2 px-2 py-1"
						required
					/>
					<div class="flex">
						<button
							type="submit"
							class="bg-black px-4 py-2 w-[45%] mr-5 rounded-lg"
						>
							Login
						</button>
						<a
							class="bg-black px-4 py-2 w-[45%] rounded-lg"
							href="/auth/signup"
						>
							Signup
						</a>
					</div>
				</form>
			</div>
		</>
	);
}
