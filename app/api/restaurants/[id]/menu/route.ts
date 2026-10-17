import { NextResponse } from "next/server";
import { caughtErrorResponse, supabaseErrorResponse, supabaseRest } from "@/lib/supabase";
import { parseMenuBody } from "@/lib/resto-server";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  try {
    const res = await supabaseRest(
      `menu_items?restaurant_id=eq.${encodeURIComponent(id)}&order=category.asc,sort_order.asc,name.asc`,
    );
    if (!res.ok) return supabaseErrorResponse(res);
    return NextResponse.json({ items: await res.json() });
  } catch (err) {
    return caughtErrorResponse(err);
  }
}

export async function POST(request: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const body = await request.json().catch(() => null);
  const parsed = parseMenuBody(body, false);
  if ("error" in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });
  try {
    const res = await supabaseRest("menu_items", {
      method: "POST",
      prefer: "return=representation",
      body: JSON.stringify({ ...parsed.data, restaurant_id: id }),
    });
    if (!res.ok) return supabaseErrorResponse(res);
    return NextResponse.json({ item: (await res.json())[0] }, { status: 201 });
  } catch (err) {
    return caughtErrorResponse(err);
  }
}
