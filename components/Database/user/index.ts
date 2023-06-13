export interface User {
	id: string;
	name: string;
	token: string;
	password: string;
	joined: number;
	nickname?: string;
	admin: boolean;
}
export type UserWithoutAuth = Omit<User, "password" | "token">;
export * from "./auth.ts";
export * from "./user.ts";