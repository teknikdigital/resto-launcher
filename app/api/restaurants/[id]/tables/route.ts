import { NextResponse } from "next/server";
import { caughtErrorResponse, supabaseErrorResponse, supabaseRest } from "@/lib/supabase";
import { fetchTables, parseTableBody } from "@/lib/resto-server";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  try {
    return NextResponse.json({ tables: await fetchTables(id, "&order=name.asc") });
  } catch (err) {
    return caughtErrorResponse(err);
  }
}

export async function POST(request: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const parsed = parseTableBody(await request.json().catch(() => null), false);
  if ("error" in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });
  try {
    const res = await supabaseRest("tables", {
      method: "POST",
      prefer: "return=representation",
      body: JSON.stringify({ restaurant_id: id, ...parsed.data }),
    });
    if (!res.ok) return supabaseErrorResponse(res);
    return NextResponse.json({ table: (await res.json())[0] }, { status: 201 });
  } catch (err) {
    return caughtErrorResponse(err);
  }
}
