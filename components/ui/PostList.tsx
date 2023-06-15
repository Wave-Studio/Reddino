import { PostWithUser } from "database";
import { truncateString } from "utils";

export default function PostList({ post }: { post: PostWithUser }) {
  return (
    <>
      <a href={`/r/${post.subName}/${post.id}`}>
        <div class="p-4 bg-[#030712] rounded-lg mt-2">
          <h1 class="text-lg font-medium">{post.title}</h1>
          <div className=" text-sm text-gray-300">
            Posted by{" "}
            {post.author.nickname != undefined
              ? `${post.author.nickname} (${post.author.name})`
              : post.author.name}{" "}
            on{" "}
            {new Intl.DateTimeFormat("en-US", {
              dateStyle: "full",
            }).format(post.createdAt)}
          </div>

          <p class="mt-4">{truncateString(post.content, 100)}</p>
        </div>
      </a>
    </>
  );
}
