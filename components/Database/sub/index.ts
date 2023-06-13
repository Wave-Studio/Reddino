import { kv } from "../db.ts";
import { User } from "../index.ts";

export interface Sub {
	name: string;
	ownerId: string;
	modIds: string[];
	created: number;
	description?: string;
}

export async function createSub(name: string, description: string | undefined, user: User | string) {
	if ((await kv.get(["sub", name.toLowerCase()])).value != undefined) {
		return { created: false, reason: "Sub already exists" };
	}

	if (name.length < 3) {
		return { created: false, reason: "Sub name too short" };
	}

	if (name.length > 20) {
		return { created: false, reason: "Sub name too long" };
	}

	const nameRegex = /[a-zA-Z0-9]{3,20}/;
	if (!nameRegex.test(name)) {
		return { created: false, reason: "Sub name must be alphanumeric" };
	}

	const sub: Sub = {
		name: name.toLowerCase(),
		ownerId: typeof user == "string" ? user : user.id,
		modIds: [],
		created: Date.now(),
		description
	}

	await kv.set(["sub", name.toLowerCase()], sub);
	return { created: true };
}

export async function getSub(name: string) {
	return (await kv.get<Sub>(["sub", name.toLowerCase()])).value;
}