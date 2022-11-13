import { useEffect, useState } from "react";
import { json } from "@remix-run/cloudflare";
import type { MetaFunction, LoaderFunction } from "@remix-run/cloudflare";
import {
  createServerClient,
  createBrowserClient,
  SupabaseClient,
  Session,
} from "@supabase/auth-helpers-remix";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useNavigate,
} from "@remix-run/react";

export type ContextType = {
  supabase: SupabaseClient | null;
  session: Session | null;
};

type LoaderData = {
  env: { SUPABASE_URL: string; SUPABASE_ANON_KEY: string };
  initialSession: Session | null;
};

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "New Remix App",
  viewport: "width=device-width,initial-scale=1",
});

export const loader: LoaderFunction = async ({ request }) => {
  const response = new Response();
  const supabaseClient = createServerClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
    request,
    response,
  });
  const {
    data: { session: initialSession },
  } = await supabaseClient.auth.getSession();

  // in order for the set-cookie header to be set,
  // headers must be returned as part of the loader response
  return json(
    {
      initialSession,
      env: {
        SUPABASE_URL,
        SUPABASE_ANON_KEY,
      },
    },
    {
      headers: response.headers,
    }
  );
};

export default function App() {
  const { env, initialSession } = useLoaderData<LoaderData>();
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);
  const [session, setSession] = useState<Session | null>(initialSession);
  const navigate = useNavigate();

  const context: ContextType = { supabase, session };

  useEffect(() => {
    if (!supabase) {
      const supabaseClient = createBrowserClient(
        env.SUPABASE_URL,
        env.SUPABASE_ANON_KEY
      );
      setSupabase(supabaseClient);
      const {
        data: { subscription },
      } = supabaseClient.auth.onAuthStateChange((_, session) =>
        setSession(session)
      );
      return () => {
        subscription.unsubscribe();
      };
    }
  }, []);

  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet context={context} />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
