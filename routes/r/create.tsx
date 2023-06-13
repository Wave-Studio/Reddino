import {
	SiteSettings,
	authHandler,
	kv,
	AuthHandlerUserCookieData,
	isUserLoggedIn,
	getSub,
	createSub,
} from "database";
import { PageProps, Handlers } from "$fresh/server.ts";
import Header from "@/components/ui/Header.tsx";
import { getCookies } from "$std/http/cookie.ts";
import { Head } from "https://deno.land/x/fresh@1.1.6/runtime.ts";

interface CreateProps extends AuthHandlerUserCookieData {
	canCreateSub: boolean;
	error?: string;
	redirect?: string;
}

export const handler: Handlers = {
	...authHandler(undefined, "/auth/login", async (req, ctx) => {
		const siteSettings = (await kv.get<SiteSettings>(["siteSettings"]))
			.value ?? { freesubcreate: false };

		return {
			canCreateSub: siteSettings.freesubcreate,
		};
	}),
	async POST(req, ctx) {
		const formData = await req.formData();
		const name = formData.get("name");
		const description = formData.get("description");
		const siteSettings = (await kv.get<SiteSettings>(["siteSettings"]))
			.value ?? { freesubcreate: false };
		const userSession = await isUserLoggedIn(getCookies(req.headers));

		if (!userSession.loggedIn) {
			return await ctx.render({
				canCreateSub: siteSettings.freesubcreate,
				error: "You must be logged in to create a sub!",
			});
		}

		if (!siteSettings.freesubcreate && !userSession.user.admin) {
			return await ctx.render({
				canCreateSub: siteSettings.freesubcreate,
				error:
					"Sub creation is currently disabled! Please contact the site administrator.",
			});
		}

		if (name == undefined) {
			return await ctx.render({
				canCreateSub: siteSettings.freesubcreate,
				error: "Sub name is required!",
			});
		}

		if (name.toString().trim().toLowerCase() == "create") {
			return await ctx.render({
				canCreateSub: siteSettings.freesubcreate,
				error: "Sub name create is reserved!",
			});
		}

		if (name.toString().trim().length < 3) {
			return await ctx.render({
				canCreateSub: siteSettings.freesubcreate,
				error: "Sub name must be at least 3 characters!",
			});
		}

		if (name.toString().trim().length > 20) {
			return await ctx.render({
				canCreateSub: siteSettings.freesubcreate,
				error: "Sub name must be less than 20 characters!",
			});
		}

		if (!/[a-zA-Z0-9_]{3,20}/.test(name.toString().trim())) {
			return await ctx.render({
				canCreateSub: siteSettings.freesubcreate,
				error: "Sub name must be alphanumeric!",
			});
		}

		const sub = await getSub(name.toString().trim().toLowerCase());

		if (sub != undefined) {
			return await ctx.render({
				canCreateSub: siteSettings.freesubcreate,
				error: "Sub already exists!",
			});
		}

		await createSub(
			name.toString().trim().toLowerCase(),
			description == undefined
				? undefined
				: description.toString() == ""
				? undefined
				: description.toString().trim(),
			userSession.user.id
		);

		return await ctx.render({
			canCreateSub: siteSettings.freesubcreate,
			redirect: `/r/${name.toString().toLowerCase().trim()}`,
		});
	},
};

export default function Create({ data }: PageProps<CreateProps>) {
	return (
		<>
			<Header user={data.user} />
			<div class="flex items-center">
				{data.redirect != undefined ? (
					<>
						<Head>
							<meta http-equiv="refresh" content={`0; url=${data.redirect}`} />
						</Head>
						<p>Redirecting to <a href={data.redirect}>{data.redirect}</a></p>
					</>
				) : (
					<>
						{data.canCreateSub || data.user.admin ? (
							<>
								<form method="post" class="flex flex-col w-[20%] items-center">
									{data.error != undefined ? <p>{data.error}</p> : <></>}
									<input
										name="name"
										type="text"
										placeholder="Sub Name"
										class="mb-2 px-2 py-1"
										required
									/>
									<textarea
										name="description"
										type="textarea"
										placeholder="Sub Description (optional)"
										class="mb-2 px-2 py-1"
									/>
									<button
										type="submit"
										class="bg-black px-4 py-2 w-[45%] rounded-lg"
									>
										Create
									</button>
								</form>
							</>
						) : (
							<>
								<p>
									Sub creation is currently disabled! Please contact the site
									administrator.
								</p>
							</>
						)}
					</>
				)}
			</div>
		</>
	);
}
