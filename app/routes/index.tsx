import { useOutletContext, useLoaderData } from "@remix-run/react";
import { Auth } from "@supabase/auth-ui-react";

import type { ContextType } from "../root";

export function loader() {
  console.log(SUPABASE_ANON_KEY);
  return null;
}

export default function Index() {
  const { session, supabase } = useOutletContext<ContextType>();
  useLoaderData();
  return (
    <div>
      <h1>Welcome!</h1>
      <Auth supabaseClient={supabase!} />
      {JSON.stringify({ session })}
    </div>
  );
}
