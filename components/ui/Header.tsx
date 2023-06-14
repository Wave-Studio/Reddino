import type { UserWithoutAuth } from "database";

export default function Header({ user }: { user?: UserWithoutAuth }) {
	return (
		<>
			<div class="flex justify-between p-2 bg-[#222]">
				<a href="/">Reddino</a>
				<div>
					{user != undefined
						? (
							<>
								<a href={`/u/${user.name}`} class="mr-3">
									{user.name}
								</a>
								<a href="/auth/logout">Logout</a>
							</>
						)
						: (
							<>
								<a href="/auth/login">Login</a>
							</>
						)}
				</div>
			</div>
		</>
	);
}
