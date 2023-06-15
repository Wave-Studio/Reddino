import {
  authHandler,
  AuthHandlerAnyoneCookieData,
  findUserFromId,
  getPostsForSub,
  getSub,
  Post,
  Sub,
  UserWithoutAuth,
} from "database";
import Header from "@/components/ui/Header.tsx";
import { Handlers, PageProps } from "$fresh/server.ts";
import PostList from "@/components/ui/PostList.tsx";

interface DataSub extends Sub {
  owner: UserWithoutAuth;
  mods: UserWithoutAuth[];
}

interface DataPost extends Post {
  author: UserWithoutAuth;
}

interface SubHomepageProps extends AuthHandlerAnyoneCookieData {
  sub?: DataSub;
  posts: DataPost[];
}

export const handler: Handlers = {
  ...authHandler(undefined, undefined, async (req, ctx) => {
    const { name } = ctx.params;
    const sub = await getSub(name);

    if (sub == undefined) {
      return { sub: undefined, posts: [] };
    } else {
      const owner = {
        ...(await findUserFromId(sub.ownerId))!,
        password: undefined,
        token: undefined,
      };
      const mods: UserWithoutAuth[] = [];

      for (const modId of sub.modIds) {
        const modData = await findUserFromId(modId);
        if (modData != undefined) {
          mods.push({
            ...modData,
            password: undefined,
            token: undefined,
          } as UserWithoutAuth);
        }
      }

      const posts = await getPostsForSub(sub.name);
      return {
        sub: {
          ...sub,
          owner,
          mods,
        },
        posts,
      };
    }
  }),
};

export default function SubHomepage({ data }: PageProps<SubHomepageProps>) {
  return (
    <>
      <Header user={data.user} />
      <div class="py-10 mx-auto w-full max-w-screen-lg">
        {data.sub != undefined ? (
          <>
            <h1 class="text-5xl font-bold">r/{data.sub.name}</h1>
            <div class="p-4 bg-[#030712] rounded-lg my-4">
              <p>Owner: {data.sub.owner.name}</p>
              <p>
                Moderators: {data.sub.mods.map((mod) => mod.name).join(", ")}
              </p>
              <p>
                Created:{" "}
                {new Intl.DateTimeFormat("en-US", {
                  dateStyle: "full",
                }).format(data.sub.created)}
              </p>
              <p>
                Description: {data.sub.description ?? "No description provided"}
              </p>
            </div>
            <div className="flex items-center mb-4 mt-6">
              <h2 class="text-xl font-bold bg-gradient-to-br from-yellow-500 to-yellow-600 w-max text-transparent bg-clip-text">
                Recent Posts
              </h2><a
                href={`/r/${data.sub.name}/post`}
                class="rounded-lg px-3.5 py-1 font-medium hover:-translate-y-0.5 transition bg-yellow-700 ml-4"
              >
                Create Post
              </a>
            </div>

            <div>
              {data.posts.map((p) => (
                <>
                  <PostList post={p} />
                </>
              ))}
            </div>
          </>
        ) : (
          <>
            <p>Unknown sub</p>
          </>
        )}
      </div>
    </>
  );
}
