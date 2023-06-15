import { kv } from "../db.ts";
import { User } from "./index.ts";

export const findUserFromId = async (id: string) => {
	return (await kv.get<User>(["users", "id", id])).value;
};

export const findUserIdFromToken = async (token: string) => {
	return (await kv.get<string>(["users", "token", token])).value;
};

export const findUserIdFromName = async (name: string) => {
	return (await kv.get<string>(["users", "name", name.toLowerCase()])).value;
};

export const updateUserInfo = async (id: string, data: Partial<User>) => {
	const user = await findUserFromId(id);
	if (!user) return false;
	await kv.set(["users", "id", id], { ...user, ...data });
	return true;
};
