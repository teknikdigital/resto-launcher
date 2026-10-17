import { NextResponse } from "next/server";
import { caughtErrorResponse, supabaseErrorResponse, supabaseRest } from "@/lib/supabase";
import { addDays, fetchSubscriptions, newTrial } from "@/lib/resto-server";
import { TRIAL_DAYS } from "@/lib/resto-types";

// POST /api/restaurants/[id]/subscription/extend | upgrade
export async function POST(_req: Request, ctx: { params: Promise<{ id: string; action: string }> }) {
  const { id, action } = await ctx.params;
  if (action !== "extend" && action !== "upgrade") {
    return NextResponse.json({ error: "Aksi tidak dikenal" }, { status: 404 });
  }
  try {
    const [sub] = await fetchSubscriptions([id]);
    let patch: Record<string, unknown>;
    if (action === "upgrade") {
      patch = { plan: "permanent" };
    } else {
      if (sub?.plan === "permanent") {
        return NextResponse.json({ error: "Langganan sudah permanen" }, { status: 400 });
      }
      // Perpanjang dari tanggal berakhir bila masih berjalan, selain itu dari sekarang.
      const end = sub?.trial_ends_at ? new Date(sub.trial_ends_at) : null;
      const base = end && end.getTime() > Date.now() ? end : new Date();
      patch = { plan: "trial", trial_ends_at: addDays(base, TRIAL_DAYS) };
    }

    const res = sub
      ? await supabaseRest(`subscriptions?restaurant_id=eq.${encodeURIComponent(id)}`, {
          method: "PATCH",
          prefer: "return=representation",
          body: JSON.stringify(patch),
        })
      : await supabaseRest("subscriptions", {
          method: "POST",
          prefer: "return=representation",
          body: JSON.stringify({ ...newTrial(id), ...patch }),
        });
    if (!res.ok) return supabaseErrorResponse(res);
    return NextResponse.json({ subscription: (await res.json())[0] });
  } catch (err) {
    return caughtErrorResponse(err);
  }
}
