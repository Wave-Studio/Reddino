import { Handlers, PageProps } from "https://deno.land/x/fresh@1.1.6/server.ts";
import Header from "@/components/ui/Header.tsx";
import {
	AuthHandlerUserCookieData,
	SiteSettings,
	authHandler,
	findUserIdFromName,
	isUserLoggedIn,
	kv,
	updateUserInfo,
} from "database";
import { getCookies } from "$std/http/cookie.ts";

interface SettingsData extends AuthHandlerUserCookieData {
	siteSettings?: SiteSettings
	error?: string;
	saved?: boolean;
}

export const handler: Handlers = {
	...authHandler(undefined, "/auth/login", async (_, __, user) => {
		if (user == undefined || !user.admin) return {};

		const siteSettings = (
			await kv.get<SiteSettings>(["siteSettings"])
		).value ?? { freesubcreate: false };

		return {
			siteSettings,
		};
	}),
	async POST(req, ctx) {
		const user = await isUserLoggedIn(getCookies(req.headers));
		const siteSettings = (
			await kv.get<SiteSettings>(["siteSettings"])
		).value ?? { freesubcreate: false };
		const data = await req.formData();
		const usernameValue = data.get("username");
		const nicknameValue = data.get("nickname");
		const nameRegex = /[a-zA-Z0-9_]{3,20}/;

		if (!user.loggedIn)
			return ctx.render({ ...user, error: "Not logged in", siteSettings });

		if (usernameValue == undefined)
			return ctx.render({
				...user,
				error: "Username is required",
				siteSettings,
			});
		const username = usernameValue.toString();

		if (username.length < 3)
			return ctx.render({
				...user,
				error: "Username must be at least 3 characters long",
				siteSettings,
			});
		if (username.length > 20)
			return ctx.render({
				...user,
				error: "Username must be at most 20 characters long",
				siteSettings,
			});
		if (!nameRegex.test(username))
			return ctx.render({
				...user,
				error: "Username must be alphanumeric",
				siteSettings,
			});

		if (nicknameValue != undefined) {
			const nickname = nicknameValue.toString();

			if (nickname != "") {
				if (nickname.length < 3)
					return ctx.render({
						...user,
						error: "Nickname must be at least 3 characters long",
						siteSettings,
					});
				if (nickname.length > 20)
					return ctx.render({
						...user,
						error: "Nickname must be at most 20 characters long",
						siteSettings,
					});
				if (!nameRegex.test(nickname))
					return ctx.render({
						...user,
						error: "Nickname must be alphanumeric",
						siteSettings,
					});
			}
		}

		const usernameId = await findUserIdFromName(username);
		if (usernameId != undefined && usernameId != user.user.id) {
			return ctx.render({
				...user,
				error: "Username already taken",
				siteSettings,
			});
		}

		await updateUserInfo(user.user.id, {
			name: username,
			nickname:
				nicknameValue != undefined
					? nicknameValue.toString() != ""
						? nicknameValue.toString()
						: undefined
					: undefined,
		});

		// Can't think of any other settings admins would need
		if (user.user.admin) {
			const freesubcreateValue = data.get("freesubcreate");
			if (freesubcreateValue != undefined) {
				siteSettings.freesubcreate =
					freesubcreateValue?.toString().toLowerCase() == "on";

				await kv.set(["siteSettings"], siteSettings);
			}
		}

		return ctx.render({
			...user,
			saved: true,
			siteSettings,
		});
	},
};

export default function SiteSettings({ data }: PageProps<SettingsData>) {
	return (
		<>
			<Header user={data.user} />
			{data.error ? (
				<>
					<p>{data.error}</p>
				</>
			) : (
				<></>
			)}
			<form class="flex flex-col items-center" method="post">
				{data.user.admin ? (
					<>
						<h1>Site settings</h1>
						<div class="w-[20%]">
							<label for="freesubcreate" class="pr-2">
								Anyone can create subs:
							</label>
							<input
								type="checkbox"
								name="freesubcreate"
								checked={data.siteSettings?.freesubcreate}
							/>
						</div>
					</>
				) : (
					<></>
				)}
				<h1>User Settings</h1>
				<div class="w-[20%]">
					<input
						type="text"
						name="username"
						placeholder="Username"
						value={data.user.name ?? "bingus"}
						class="w-[100%] mb-2 px-2 py-1"
						required
					/>
					<input
						type="text"
						name="nickname"
						placeholder="Nickname (optional)"
						value={data.user.nickname}
						class="w-[100%] px-2 py-1"
					/>
				</div>

				<button type="submit" class="bg-black px-4 py-2 rounded-lg mt-2">
					Save
				</button>
			</form>
		</>
	);
}
