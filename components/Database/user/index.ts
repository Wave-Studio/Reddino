export interface User {
	id: string;
	name: string;
	token: string;
	password: string;
	joined: number;
	nickname?: string;
	admin: boolean;
}
export * from "./auth.ts";
export * from "./user.ts";