// Klien REST Supabase (PostgREST) khusus server. Jangan diimpor dari komponen client.
import { NextResponse } from "next/server";

export { LEAD_STATUSES } from "./lead-types";

type SupabaseError = { message?: string; code?: string; details?: string; hint?: string };

// Teruskan error asli PostgREST (message/code/details/hint) beserta status aslinya.
export async function supabaseErrorResponse(res: Response): Promise<NextResponse> {
  const raw = await res.text();
  let error: SupabaseError;
  try {
    error = JSON.parse(raw) as SupabaseError;
  } catch {
    error = { message: raw || res.statusText };
  }
  console.error("Supabase error:", error);
  return NextResponse.json(
    { error: error.message, code: error.code, details: error.details, hint: error.hint },
    { status: res.status },
  );
}

// Error non-HTTP (konfigurasi hilang, jaringan putus, dll).
export function caughtErrorResponse(err: unknown): NextResponse {
  console.error("Supabase error:", err);
  const e = err as SupabaseError | undefined;
  return NextResponse.json(
    {
      error: e?.message ?? String(err),
      code: e?.code ?? null,
      details: e?.details ?? null,
      hint: e?.hint ?? null,
    },
    { status: 500 },
  );
}

export async function supabaseRest(
  path: string,
  init: RequestInit & { prefer?: string } = {},
): Promise<Response> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Konfigurasi Supabase di server belum lengkap");
  }
  const { prefer, ...rest } = init;
  return fetch(`${url.replace(/\/$/, "")}/rest/v1/${path}`, {
    ...rest,
    cache: "no-store",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      ...(prefer ? { Prefer: prefer } : {}),
      ...(rest.headers ?? {}),
    },
  });
}
