import { PostWithUser } from "database";
import { truncateString } from "utils";

export default function PostList({ post }: { post: PostWithUser }) {
	return (
		<>
			<a href={`/r/${post.subName}/${post.id}`}>
				<div class="mt-2">
					<h1>{post.title}</h1>
					<h2>
						By: {post.author.nickname != undefined
							? `${post.author.nickname} (${post.author.name})`
							: post.author.name}
					</h2>
					<h3>
						Posted: {new Intl.DateTimeFormat("en-US", {
							dateStyle: "full",
						}).format(post.createdAt)}
					</h3>
					<p>{truncateString(post.content, 100)}</p>
				</div>
			</a>
		</>
	);
}
