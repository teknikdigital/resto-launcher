import { NextResponse } from "next/server";

const FIELD_MASK =
  "places.id,places.displayName,places.formattedAddress,places.nationalPhoneNumber,places.rating,places.userRatingCount,places.websiteUri,places.googleMapsUri,places.photos.name";

type GooglePlace = {
  id: string;
  displayName?: { text?: string };
  formattedAddress?: string;
  nationalPhoneNumber?: string;
  rating?: number;
  userRatingCount?: number;
  websiteUri?: string;
  googleMapsUri?: string;
  photos?: { name?: string }[];
};

export async function POST(request: Request) {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "API key Google Places belum dikonfigurasi" }, { status: 500 });
  }

  const body = await request.json().catch(() => null);
  const query = typeof body?.query === "string" ? body.query.trim() : "";
  if (!query) {
    return NextResponse.json({ error: "Keyword wajib diisi" }, { status: 400 });
  }
  const maxResults = Math.min(Math.max(Number(body?.maxResults) || 20, 1), 20);

  const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": FIELD_MASK,
    },
    body: JSON.stringify({ textQuery: query, pageSize: maxResults, languageCode: "id" }),
    cache: "no-store",
  });

  if (!res.ok) {
    const raw = await res.text();
    let googleError: { message?: string; status?: string; code?: number; details?: unknown } | undefined;
    try {
      googleError = (JSON.parse(raw) as { error?: typeof googleError }).error;
    } catch {
      // body bukan JSON; pakai teks mentah
    }
    console.error("Google Places error:", googleError ?? raw);
    return NextResponse.json(
      {
        error: googleError?.message ?? (raw || res.statusText),
        code: googleError?.status ?? googleError?.code ?? null,
        details: googleError?.details ?? null,
      },
      { status: res.status },
    );
  }

  const data = (await res.json()) as { places?: GooglePlace[] };
  const places = (data.places ?? []).map((p) => ({
    place_id: p.id,
    name: p.displayName?.text ?? "",
    address: p.formattedAddress ?? null,
    phone: p.nationalPhoneNumber ?? null,
    rating: p.rating ?? null,
    user_ratings_total: p.userRatingCount ?? null,
    website: p.websiteUri ?? null,
    maps_url: p.googleMapsUri ?? null,
    // URL proxy (API key Google tetap di server); null bila tempat tanpa foto.
    photo_url: p.photos?.[0]?.name ? `/api/places/photo?ref=${encodeURIComponent(p.photos[0].name)}` : null,
  }));
  return NextResponse.json({ places });
}
