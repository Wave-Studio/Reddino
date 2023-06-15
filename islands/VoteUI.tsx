import { useState } from "preact/hooks";
import { authHandler, VoteInfo } from "database";
import ArrowBigUpFilled from "https://deno.land/x/tabler_icons_tsx@0.0.4/tsx/arrow-big-up-filled.tsx";
import ArrowBigDownFilled from "https://deno.land/x/tabler_icons_tsx@0.0.4/tsx/arrow-big-down-filled.tsx"


export default function VoteUI({
	currentVotes,
	hasUserUpvoted,
	hasUserDownvoted,
	postInfo,
	userId,
}: {
	currentVotes: number;
	hasUserUpvoted: boolean;
	hasUserDownvoted: boolean;
	postInfo: VoteInfo;
	userId: string | undefined;
}) {
	const [votes, setVotes] = useState(currentVotes);
	const [userUpvoted, setUserUpvoted] = useState(hasUserUpvoted);
	const [userDownvoted, setUserDownvoted] = useState(hasUserDownvoted);

	const vote = async (type: "upvote" | "downvote" | "unvote") => {
		await fetch(
			`/api/vote?voteType=${type}&subName=${postInfo.sub}&postId=${postInfo.post}`,
			{
				method: "POST",
			},
		);
	};

	const upvote = () => {
		if (userId == undefined) return;
		if (userUpvoted) {
			setVotes(votes - 1);
			setUserUpvoted(false);
			vote("unvote");
		} else {
			setVotes(votes + 1 + (userDownvoted ? 1 : 0));
			setUserUpvoted(true);
			setUserDownvoted(false);
			vote("upvote");
		}
	};

	const downvote = () => {
		if (userId == undefined) return;
		if (userDownvoted) {
			setVotes(votes + 1);
			setUserDownvoted(false);
			vote("unvote");
		} else {
			setVotes(votes - 1 - (userUpvoted ? 1 : 0));
			setUserUpvoted(false);
			setUserDownvoted(true);
			vote("downvote");
		}
	};

	return (
		<>
			<div class={"flex flex-col font-medium"}>
				<button
					class={`${userUpvoted ? "text-blue-500" : ""}`}
					onClick={upvote}
				>
					<ArrowBigUpFilled />
				</button>
				<p class="text-center">{votes}</p>
				<button
					class={`${userDownvoted ? "text-blue-500" : ""}`}
					onClick={downvote}
				>
					<ArrowBigDownFilled />
				</button>
			</div>
		</>
	);
}
