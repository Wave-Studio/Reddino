import { findUserFromId, getSub, kv, Sub, UserWithoutAuth } from "database";

export interface Post {
	id: string;
	title: string;
	content: string;
	authorId: string;
	subName: string;
	createdAt: number;
	votes: number;
}

export interface PostWithUser extends Post {
	author: UserWithoutAuth;
}

export const createPostId = async (
	subName: string,
	sub?: Sub,
): Promise<
	{ created: true; id: string } | { created: false; reason: string }
> => {
	sub ??= (await getSub(subName)) ?? undefined;
	if (sub == undefined) {
		return { created: false, reason: "Sub does not exist" };
	}
	const id = Math.random().toString(36).substring(2, 9).toLowerCase();
	const post = await getPost(subName, id);
	if (post == undefined) {
		return { created: true, id };
	} else {
		console.log("Remaking", post);
		return await createPostId(subName, sub);
	}
};

export const createPost = async (
	post: Omit<Omit<Omit<Post, "id">, "createdAt">, "votes">,
): Promise<
	{ created: false; reason: string } | { created: true; id: string }
> => {
	const sub = await getSub(post.subName.toLowerCase().trim());
	if (sub == undefined) {
		return { created: false, reason: "Sub does not exist" };
	}
	const postId = await createPostId(post.subName.toLowerCase().trim());
	if (postId.created) {
		const postObject: Post = {
			...post,
			id: postId.id,
			createdAt: Date.now(),
			votes: 0,
		};
		await kv
			.atomic()
			.set(
				["sub", post.subName.toLowerCase().trim(), "post", postId.id],
				postObject,
			)
			.set(
				["users", "posts", post.authorId],
				[
					{
						id: postId.id,
						subName: post.subName.toLowerCase().trim(),
					},
					...((
						await kv.get<{ id: string; subName: string }[]>([
							"user",
							"posts",
							post.authorId,
						])
					).value ?? []),
				],
			)
			.set(
				["posts"],
				[
					{
						id: postId.id,
						subName: post.subName.toLowerCase().trim(),
					},
					...((
						await kv.get<{ id: string; subName: string }[]>([
							"posts",
						])
					).value ?? []),
				],
			)
			.commit();
		return { created: true, id: postId.id };
	} else {
		return { created: false, reason: postId.reason };
	}
};

export const getPost = async (subName: string, id: string) => {
	return (
		await kv.get<Post>([
			"sub",
			subName.toLowerCase().trim(),
			"post",
			id.toLowerCase(),
		])
	).value;
};

export const getPostsForSub = async (
	subName: string,
): Promise<PostWithUser[]> => {
	const posts: PostWithUser[] = [];

	for await (
		const post of kv.list<Post>({
			prefix: ["sub", subName.toLowerCase().trim(), "post"],
		})
	) {
		const author = {
			...(await findUserFromId(post.value.authorId))!,
			password: undefined,
			token: undefined,
		};
		posts.push({ ...post.value, author });
	}

	return posts.sort((a, b) => b.createdAt - a.createdAt);
};

export const getPostsForUser = async (
	userId: string,
): Promise<PostWithUser[]> => {
	const posts: PostWithUser[] = [];
	const user = await findUserFromId(userId);
	const userPosts = await kv.get<{ id: string; subName: string }[]>([
		"user",
		"posts",
		userId,
	]);

	if (userPosts.value == undefined) {
		return [];
	}

	for await (const postData of userPosts.value) {
		const post = await getPost(postData.subName, postData.id);
		if (post != undefined) {
			const author = {
				...user,
				password: undefined,
				token: undefined,
			} as UserWithoutAuth;
			posts.push({ ...post, author });
		}
	}

	return posts.sort((a, b) => b.createdAt - a.createdAt);
};

export const getPosts = async (): Promise<PostWithUser[]> => {
	const posts: PostWithUser[] = [];

	for (
		const postData of (
			(await kv.get<{ id: string; subName: string }[]>(["posts"]))
				.value ?? []
		).slice(0, 100)
	) {
		const post = (await getPost(postData.subName, postData.id))!;
		const author = {
			...(await findUserFromId(post.authorId))!,
			password: undefined,
			token: undefined,
		};
		posts.push({ ...post, author });
	}

	return posts.sort((a, b) => b.createdAt - a.createdAt);
};
