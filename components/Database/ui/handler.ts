import { HandlerContext, Handlers } from "$fresh/server.ts";
import { deleteCookie, getCookies, setCookie } from "$std/http/cookie.ts";
import { isUserLoggedIn, User} from "../user/index.ts";

export interface AuthHandlerAnyoneCookieData {
	user?: Omit<Omit<User, "password">, "token">;
}

export interface AuthHandlerUserCookieData {
	user: Omit<Omit<User, "password">, "token">;
}

export const authHandler = (
	redirectIfAuthenticated?: string,
	redirectIfNotAuthenticated?: string,
	addedProps?: (
		req: Request,
		// deno-lint-ignore no-explicit-any
		ctx: HandlerContext<any, Record<string, unknown>>,
		user?: User
	) => Promise<Record<string, unknown>> | Record<string, unknown>
): Handlers => ({
	async GET(req, ctx) {
		const cookies = getCookies(req.headers);

		const possibleUser = await isUserLoggedIn(cookies);
		if (possibleUser.loggedIn) {
			const user = possibleUser.user;
			if (redirectIfAuthenticated != undefined) {
				return new Response("Redirecting...", {
					headers: {
						Location: redirectIfAuthenticated,
					},
					status: 307,
				});
			}

			const addedPropsValue = (addedProps != undefined ? await addedProps(req, ctx, user) : {})

			const addedPropsUserOmmited = {
				...addedPropsValue,
			}

			delete addedPropsUserOmmited.user;

			const render = await ctx.render({
				user: {
					...user,
					password: undefined,
					...(addedPropsValue.user != undefined ? addedPropsValue.user : {})
				},
				...(addedPropsUserOmmited),
			});

			// Renew cookie
			setCookie(render.headers, {
				name: "token",
				value: user.token,
				path: "/",
				expires: Date.now() + 30 * 24 * 60 * 1000,
			});

			return render;
		} else {
			if (redirectIfNotAuthenticated != undefined) {
				return new Response("Redirecting...", {
					headers: {
						Location: redirectIfNotAuthenticated,
					},
					status: 307,
				});
			}
			const response = await ctx.render({
				loggedIn: true,
				...(addedProps != undefined ? await addedProps(req, ctx, undefined) : {}),
			});

			if (cookies.token != undefined) {
				deleteCookie(response.headers, "token");
			}

			return response;
		}
	},
});
