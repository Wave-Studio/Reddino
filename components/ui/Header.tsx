import type { UserWithoutAuth } from "database";

export default function Header({ user }: { user: UserWithoutAuth | undefined }) {
	return (
		<>
			<div class="flex justify-between h-14 items-center px-4 bg-gray-700 bg-opacity-50 backdrop-blur-md">
				<a href="/" class="text-xl font-bold">Reddino</a>
				<div>
					{user != undefined
						? (
							<>
								<a href={`/u/${user.name}`} class="mr-4">
									{user.name}
								</a>
								<a href="/auth/logout" class="rounded-lg px-3.5 py-1 font-medium hover:-translate-y-0.5 transition bg-gray-700">Logout</a>
							</>
						)
						: (
							<>
								<a href="/auth/signup" class="rounded-lg px-3.5 py-1 font-medium hover:-translate-y-0.5 transition bg-yellow-700">Signup</a>
							</>
						)}
				</div>
			</div>
		</>
	);
}
