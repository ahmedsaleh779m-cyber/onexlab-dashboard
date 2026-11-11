import { createClient } from "@/lib/supabase/client";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://lab.onexlab.site";

export async function apiClient<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const headers = new Headers(options.headers || {});
  headers.set("Content-Type", "application/json");

  if (session?.access_token) {
    headers.set("Authorization", `Bearer ${session.access_token}`);
  }

  const url = `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let message = `API request failed with status ${response.status}`;
    try {
      const errorBody = await response.text();
      const parsed = JSON.parse(errorBody);
      message = parsed.detail || parsed.message || message;
    } catch {
      // fallback message
    }
    throw new Error(message);
  }

  return response.json();
}
