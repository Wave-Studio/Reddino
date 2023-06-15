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
				expires: Date.now() + 30 * 24 * 60 * 1000,
			});
			return resp;
		}
	},
};

export default function Signup({ data }: PageProps<ErrorProps>) {
	return (
		<>
			<Header user={data.user} />
			<div class="flex flex-col items-center py-10">
				<div className="rounded-xl bg-[#030712] flex flex-col p-6 max-w-sm w-full">
				<h1 class="text-4xl font-bold">Signup</h1>
				
				{data.errorMessage != undefined
					? (
						<>
							<p>{data.errorMessage}</p>
						</>
					)
					: <></>}
				<form method="post" class="flex flex-col gap-2 mt-4">
					<label htmlFor="username" class="flex flex-col">
						<span class="text-sm text-gray-300 font-medium">Username</span> 
					<input
						type="text"
						name="username"
						placeholder="spez"
						class="mb-2 px-2 py-1"
						required
					/></label>
						<label htmlFor="password" class="flex flex-col">
						<span class="text-sm text-gray-300 font-medium">Password</span> 
					<input
						type="password"
						name="password"
						placeholder="$upersecurepassword123"
						class="mb-2 px-2 py-1"
						required
					/></label>
					<div class="flex">
						<button
							type="submit"
							class="bg-yellow-700 font-medium px-4 py-2 mt-2 mx-auto rounded-lg"
						>
							Signup
						</button>
						
					</div>
				</form></div>
				<p class="text-sm mt-4 text-gray-400">Returning user? <a href="/auth/login" class="underline text-gray-300">Log in</a> instead</p>
			</div>
		</>
	);
}
