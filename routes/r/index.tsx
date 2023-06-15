import { PageProps } from "$fresh/server.ts";
import { authHandler, kv, Sub, AuthHandlerAnyoneCookieData } from "database";
import Header from "@/components/ui/Header.tsx";

interface SubHomeProps extends AuthHandlerAnyoneCookieData {
  subs: string[];
}

export const handler = authHandler(undefined, undefined, async (req, ctx) => {
  const subs = [];

  for await (const sub of kv.list<Sub>({ prefix: ["sub"] })) {
    if (sub.key.length > 2) continue;
    subs.push(sub.value.name);
  }

  return {
    subs,
  };
});

export default function SubHome({ data }: PageProps<SubHomeProps>) {
  return (
    <>
      <Header user={data.user} />
      <div class="py-10 mx-auto w-full max-w-screen-lg">
        <h1 class="text-5xl font-bold">Subs</h1>

        {data.user && (
          <div class="mt-4">
            <a href="/r/create">
              <div class="rounded-lg px-3.5 py-1 font-medium hover:-translate-y-0.5 transition bg-yellow-700 w-max">
                Create Sub
              </div>
            </a>
          </div>
        )}
        <div className="grid grid-cols-3 gap-2 mt-4 font-semibold">
          {data.subs.map((sub) => (
            <a href={`/r/${sub}`}>
              <div class="p-4 bg-[#030712] rounded-lg hover:-translate-y-1 transition">
                r/{sub}
              </div>
            </a>
          ))}
        </div>
      </div>
    </>
  );
}
