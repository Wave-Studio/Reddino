import type { Handlers, PageProps } from "$fresh/server.ts";
import {
  authHandler,
  AuthHandlerAnyoneCookieData,
  getPosts,
  PostWithUser,
} from "database";
import Header from "@/components/ui/Header.tsx";
import PostList from "@/components/ui/PostList.tsx";

interface HomeProps extends AuthHandlerAnyoneCookieData {
  posts: PostWithUser[];
}

export const handler: Handlers = {
  ...authHandler(undefined, undefined, async (req, ctx) => {
    const posts = (await getPosts()) ?? [];
    return { posts };
  }),
  async POST(req, ctx) {
    // Fix 405 error from logging in
    return await authHandler().GET!(req, ctx);
  },
};

export default function Home({ data }: PageProps<HomeProps>) {
  return (
    <>
      <Header user={data.user} />
      <div class="py-10 mx-auto w-full max-w-screen-lg">
        <h1 class="text-5xl font-bold">
          {data.user == undefined
            ? "Welcome to Reddino"
            : `Welcome Back, ${data.user.name}`}
        </h1>
        <div className="mt-4">
          <div className="flex gap-2 mt-1">
            {data.user != undefined && (
              <a
                href="/r/create"
                class="rounded-lg px-3.5 py-1 font-medium hover:-translate-y-0.5 transition bg-yellow-700"
              >
                Create Sub
              </a>
            )}
            <a
              href="/r"
              class="rounded-lg px-3.5 py-1 font-medium hover:-translate-y-0.5 transition bg-yellow-700"
            >
              Browse Subs
            </a>
          </div>
        </div>
        <div class="mt-4">
          <h2 class="text-xl font-bold bg-gradient-to-br from-yellow-500 to-yellow-600 w-max text-transparent bg-clip-text">
            Recent Posts
          </h2>
          {(data.posts ?? []).map((p) => (
            <>
              <PostList post={p} />
            </>
          ))}
        </div>
      </div>
    </>
  );
}
