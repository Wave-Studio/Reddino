import { kv } from "../db.ts";
import { User } from "./index.ts";
import {
	findUserFromId,
	findUserIdFromName,
	findUserIdFromToken,
} from "./user.ts";

export const createUserToken = async (id: string): Promise<string> => {
	const token = btoa(id) +
		"_" +
		Math.random().toString(36).substring(2, 15) +
		Math.random().toString(36).substring(2, 15);
	if ((await findUserIdFromToken(token)) != undefined) {
		return await createUserToken(id);
	}
	return token;
};

export const createUser = async (
	name: string,
	password: string,
): Promise<
	{ created: false; error: string } | { created: true; user: User }
> => {
	// No duplicate names
	if ((await findUserIdFromName(name.toLowerCase())) != undefined) {
		return { created: false, error: "User already exists" };
	}

	// Username must be at least 3 characters
	if (name.length < 3) {
		return {
			created: false,
			error: "Username must be at least 3 characters",
		};
	}

	// Username must be less than 16 characters
	if (name.length > 16) {
		return {
			created: false,
			error: "Username must be less than 16 characters",
		};
	}

	// Username must be alphanumeric
	const usernameRegex = /[a-zA-Z0-9_]{3,16}/;
	if (!usernameRegex.test(name)) {
		return { created: false, error: "Username must be alphanumeric" };
	}

	const userId = crypto.randomUUID();
	const token = await createUserToken(userId);
	const user: User = {
		id: userId,
		name: name.toLowerCase(),
		token: token,
		password: password,
		joined: Date.now(),
		admin: (await kv.get(["isSiteConfigured"])).value == false,
	};

	// I could probably reduce this to 1 key being set but that would probably reduce the speed of queries in the future
	const res = await kv
		.atomic()
		.set(["users", "id", userId], user)
		.set(["users", "token", token], userId)
		.set(["users", "name", name.toLowerCase()], userId)
		.commit();

	if (res.ok) {
		await kv.set(["isSiteConfigured"], true);
		return { created: true, user: user };
	}
	return await createUser(name, password);
};

export const isUserLoggedIn = async (
	cookies: Record<string, string>,
): Promise<{ loggedIn: false } | { loggedIn: true; user: User }> => {
	const token = cookies.token;

	if (token == undefined) return { loggedIn: false };

	const userId = await findUserIdFromToken(token);

	if (userId == undefined) {
		return { loggedIn: false };
	} else {
		return { loggedIn: true, user: (await findUserFromId(userId))! };
	}
};

export const loginUser = async (
	username: string,
	password: string,
): Promise<
	{ loggedIn: false; error: string } | { loggedIn: true; user: User }
> => {
	const userId = await findUserIdFromName(username.toLowerCase());
	if (userId == undefined) {
		return { loggedIn: false, error: "User not found" };
	}
	const user = (await findUserFromId(userId))!;
	if (user.password != password) {
		return { loggedIn: false, error: "Incorrect password" };
	}
	return { loggedIn: true, user: user };
};
