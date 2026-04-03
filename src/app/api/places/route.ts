import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

function key() {
  const k = process.env.GOOGLE_MAPS_API_KEY?.trim();
  if (!k) throw new Error("GOOGLE_MAPS_API_KEY não configurada.");
  return k;
}

// Cache simples in-memory (bom para single instance; em serverless pode variar)
const cache = new Map<string, { at: number; data: unknown }>();
const TTL_MS = 60 * 60 * 1000;

type Place = {
  id: string;
  displayName: string;
  formattedAddress?: string;
  rating?: number;
  userRatingCount?: number;
  location?: { latitude: number; longitude: number };
};

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const url = new URL(req.url);
  const lat = Number(url.searchParams.get("lat"));
  const lng = Number(url.searchParams.get("lng"));
  const radius = Math.min(5000, Math.max(500, Number(url.searchParams.get("r") ?? "2500")));

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return NextResponse.json({ error: "Coordenadas inválidas" }, { status: 400 });
  }

  const round = (n: number) => Math.round(n * 1000) / 1000;
  const cacheKey = `${round(lat)}:${round(lng)}:${radius}`;
  const now = Date.now();
  const hit = cache.get(cacheKey);
  if (hit && now - hit.at < TTL_MS) {
    return NextResponse.json(hit.data);
  }

  // Places API (New) - Nearby Search via POST
  const body = {
    includedTypes: ["church"],
    maxResultCount: 20,
    locationRestriction: {
      circle: {
        center: { latitude: lat, longitude: lng },
        radius,
      },
    },
  };

  const res = await fetch("https://places.googleapis.com/v1/places:searchNearby", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": key(),
      "X-Goog-FieldMask":
        "places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.location",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    return NextResponse.json(
      { error: `Google Places: ${res.status}`, detail: txt.slice(0, 500) },
      { status: 502 }
    );
  }

  const json = (await res.json()) as { places?: any[] };
  const places: Place[] = (json.places ?? []).map((p) => ({
    id: String(p.id),
    displayName: String(p.displayName?.text ?? p.displayName ?? "Igreja"),
    formattedAddress: p.formattedAddress,
    rating: typeof p.rating === "number" ? p.rating : undefined,
    userRatingCount:
      typeof p.userRatingCount === "number" ? p.userRatingCount : undefined,
    location: p.location
      ? { latitude: p.location.latitude, longitude: p.location.longitude }
      : undefined,
  }));

  const out = { places };
  cache.set(cacheKey, { at: now, data: out });
  return NextResponse.json(out);
}

