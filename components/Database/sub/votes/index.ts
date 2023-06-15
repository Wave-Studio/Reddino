import { kv, Post } from "database";

export interface VoteInfo {
	sub: string;
	post: string;
	/** Likely will not be implemented before the hackathon ends */
	comment?: string;
}

export const getUserUpvotes = async (userId: string) => {
	const upvotes = await kv.get<VoteInfo[]>(["upvotes", userId]);
	return upvotes.value ?? [];
};

export const getUserDownvotes = async (userId: string) => {
	const downvotes = await kv.get<VoteInfo[]>(["downvotes", userId]);
	return downvotes.value ?? [];
};

export const hasUserUpvoted = async (userId: string, info: VoteInfo) => {
	const upvotes = await getUserUpvotes(userId);
	return upvotes.some(
		(v) => v.post === info.post && info.comment === v.comment,
	);
};

export const hasUserDownvoted = async (userId: string, info: VoteInfo) => {
	const downvotes = await getUserDownvotes(userId);
	return downvotes.some(
		(v) => v.post === info.post && info.comment === v.comment,
	);
};

export const upvote = async (
	userId: string,
	info: VoteInfo,
): Promise<{ voted: false; reason: string } | { voted: true }> => {
	const upvotes = await getUserUpvotes(userId);
	const downvotes = await getUserDownvotes(userId);

	if (
		upvotes.some((v) => v.post === info.post && info.comment === v.comment)
	) {
		return { voted: false, reason: "already upvoted" };
	}

	const postKey = [
		"sub",
		info.sub,
		"post",
		info.post,
		...(info.comment ? ["comment", info.comment] : []),
	];
	const postInfo = (await kv.get<Post>(postKey)).value;

	if (postInfo == undefined) {
		return { voted: false, reason: "post does not exist" };
	}

	// Legacy code support
	postInfo.votes ??= 0;

	await kv
		.atomic()
		.set(["upvotes", userId], [...upvotes, info])
		.set(
			["downvotes", userId],
			downvotes.filter((v) => v.post !== info.post),
		)
		.set(postKey, {
			...postInfo,
			votes: postInfo.votes +
				1 +
				(downvotes.find((p) =>
						p.sub === info.sub && p.post === info.post
					) !=
						undefined
					? 1
					: 0),
		})
		.commit();

	return { voted: true };
};

export const unvote = async (userId: string, info: VoteInfo) => {
	const upvotes = await getUserUpvotes(userId);
	const downvotes = await getUserDownvotes(userId);

	if (
		!upvotes.some((v) =>
			v.post === info.post && info.comment === v.comment
		) &&
		!downvotes.some((v) =>
			v.post === info.post && info.comment === v.comment
		)
	) {
		return { voted: false, reason: "not voted" };
	}

	const postKey = [
		"sub",
		info.sub,
		"post",
		info.post,
		...(info.comment ? ["comment", info.comment] : []),
	];

	const postInfo = (await kv.get<Post>(postKey)).value;

	if (postInfo == undefined) {
		return { voted: false, reason: "post does not exist" };
	}

	// Legacy code support
	postInfo.votes ??= 0;

	let votes = postInfo.votes;

	if (upvotes.find((p) => p.post == info.post && p.comment == info.comment)) {
		votes--;
	}

	if (
		downvotes.find((p) => p.post == info.post && p.comment == info.comment)
	) {
		votes++;
	}

	await kv
		.atomic()
		.set(
			["upvotes", userId],
			upvotes.filter((v) => v.post !== info.post),
		)
		.set(
			["downvotes", userId],
			downvotes.filter((v) => v.post !== info.post),
		)
		.set(postKey, {
			...postInfo,
			votes,
		})
		.commit();

	return { voted: true };
};

export const downvote = async (
	userId: string,
	info: VoteInfo,
): Promise<{ voted: false; reason: string } | { voted: true }> => {
	const upvotes = await getUserUpvotes(userId);
	const downvotes = await getUserDownvotes(userId);

	if (
		downvotes.some((v) =>
			v.post === info.post && info.comment === v.comment
		)
	) {
		return { voted: false, reason: "already downvoted" };
	}

	const postKey = [
		"sub",
		info.sub,
		"post",
		info.post,
		...(info.comment ? ["comment", info.comment] : []),
	];
	const postInfo = (await kv.get<Post>(postKey)).value;

	if (postInfo == undefined) {
		return { voted: false, reason: "post does not exist" };
	}

	// Legacy code support
	postInfo.votes ??= 0;

	await kv
		.atomic()
		.set(
			["upvotes", userId],
			upvotes.filter((v) => v.post !== info.post),
		)
		.set(["downvotes", userId], [...downvotes, info])
		.set(postKey, {
			...postInfo,
			votes: postInfo.votes -
				1 -
				(upvotes.find(
						(p) => p.post == info.post && p.comment == info.comment,
					) != undefined
					? 1
					: 0),
		})
		.commit();

	return { voted: true };
};
