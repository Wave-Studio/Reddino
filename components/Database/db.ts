const env = Deno.env.get("ENVIRONMENT");
export const kv = await Deno.openKv(
	env && env == "PRODUCTION" ? undefined : "./db/db.sqlite3"
);

const isNextUserAdmin = await kv.get(["isSiteConfigured"]);
if (isNextUserAdmin.value == undefined) {
	await kv.set(["isSiteConfigured"], false);
}

export interface SiteSettings {
	freesubcreate: boolean;
}
