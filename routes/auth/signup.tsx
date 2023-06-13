import { Handlers, PageProps } from "$fresh/server.ts";
import { authHandler, AuthHandlerAnyoneCookieData, createUser } from "database";
import Header from "@/components/ui/Header.tsx";
import { setCookie } from "$std/http/cookie.ts";

export interface ErrorProps extends AuthHandlerAnyoneCookieData {
	errorMessage?: string;
}

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

		const createdUser = await createUser(
			username.toString().toLowerCase(),
			password.toString(),
		);
		if (createdUser.created == false) {
			return ctx.render({
				errorMessage: createdUser.error,
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
				value: createdUser.user.token,
				path: "/",
			});
			return resp;
		}
	},
};

export default function Signup({ data }: PageProps<ErrorProps>) {
	return (
		<>
			<Header user={data.user} />
			<div class="flex flex-col items-center">
				<h1>Signup</h1>
				<h2 class="font-bold text-red-800">
					If you forget your password you will not be able to recover
					your account!
				</h2>
				{data.errorMessage != undefined
					? (
						<>
							<p>{data.errorMessage}</p>
						</>
					)
					: <></>}
				<form method="post" class="flex flex-col w-[20%] items-center">
					<input
						type="text"
						name="username"
						placeholder="Username"
						class="mb-2 px-2 py-1"
					/>
					<input
						type="password"
						name="password"
						placeholder="Password"
						class="mb-2 px-2 py-1"
					/>
					<div class="flex">
						<button
							type="submit"
							class="bg-black px-4 py-2 w-[45%] mr-5 rounded-lg"
						>
							Signup
						</button>
						<a
							class="bg-black px-4 py-2 w-[45%] rounded-lg"
							href="/auth/login"
						>
							Login
						</a>
					</div>
				</form>
			</div>
		</>
	);
}
