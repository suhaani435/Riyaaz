import { createBrowserClient } from "@supabase/ssr";

/**
 * Create a Supabase client configured for browser execution.
 */
export function createClient() {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    "https://puudmecclvrffdlctqpj.supabase.co";
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB1dWRtZWNjbHZyZmZkbGN0cXBqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ2MzU2NjgsImV4cCI6MjEwMDIxMTY2OH0.X7jl4o22YiWlqMy4iIvVO2LBTmZ_ihtNnJPBDKlAJYI";

  return createBrowserClient(url, anonKey);
}
