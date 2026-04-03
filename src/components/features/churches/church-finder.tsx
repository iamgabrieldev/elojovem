"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type Place = {
  id: string;
  displayName: string;
  formattedAddress?: string;
  rating?: number;
  userRatingCount?: number;
  location?: { latitude: number; longitude: number };
};

type Props = {
  traditionLabel: "Paróquias" | "Igrejas";
};

export function ChurchFinder({ traditionLabel }: Props) {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [places, setPlaces] = useState<Place[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const mapsUrl = useMemo(() => {
    if (!coords) return null;
    return `https://www.google.com/maps/search/?api=1&query=${coords.lat},${coords.lng}`;
  }, [coords]);

  async function fetchPlaces(lat: number, lng: number) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/places?lat=${lat}&lng=${lng}&r=2500`);
      const json = (await res.json()) as { places?: Place[]; error?: string };
      if (!res.ok) {
        setError(json.error || "Não foi possível buscar lugares.");
        setPlaces(null);
      } else {
        setPlaces(json.places ?? []);
      }
    } catch {
      setError("Erro de conexão ao buscar lugares.");
    } finally {
      setLoading(false);
    }
  }

  function requestLocation() {
    setError(null);
    if (!("geolocation" in navigator)) {
      setError("Seu navegador não suporta geolocalização.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setCoords({ lat, lng });
        fetchPlaces(lat, lng);
      },
      () => {
        setError(
          "Sem permissão de localização. Ative o acesso para ver igrejas próximas."
        );
      },
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 60_000 }
    );
  }

  useEffect(() => {
    requestLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-bold text-slate-900">{traditionLabel} próximas</h1>
        <p className="mt-1 text-sm text-slate-500">
          Nós usamos sua localização para mostrar opções perto de você.
        </p>
      </div>

      <div className="flex gap-2">
        <Button variant="secondary" onClick={requestLocation} loading={loading}>
          Atualizar
        </Button>
        {mapsUrl ? (
          <a
            href={mapsUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-2.5 text-base font-medium text-slate-800 shadow-sm transition-colors hover:bg-slate-50"
          >
            Abrir no Maps
          </a>
        ) : null}
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      {places && places.length === 0 ? (
        <Card className="text-center">
          <p className="text-sm text-slate-600">
            Nenhum resultado por perto. Tente novamente em alguns minutos.
          </p>
        </Card>
      ) : null}

      {places ? (
        <div className="flex flex-col gap-3">
          {places.map((p) => {
            const q = encodeURIComponent(p.displayName);
            const url = p.location
              ? `https://www.google.com/maps/search/?api=1&query=${q}&query_place_id=${encodeURIComponent(
                  p.id
                )}`
              : `https://www.google.com/maps/search/?api=1&query=${q}`;
            return (
              <a key={p.id} href={url} target="_blank" rel="noreferrer">
                <Card className="hover:border-amber-200 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900">{p.displayName}</p>
                      {p.formattedAddress ? (
                        <p className="mt-1 text-sm text-slate-500">
                          {p.formattedAddress}
                        </p>
                      ) : null}
                      {typeof p.rating === "number" ? (
                        <p className="mt-2 text-xs text-slate-500">
                          {p.rating.toFixed(1)} ★
                          {p.userRatingCount ? ` (${p.userRatingCount})` : ""}
                        </p>
                      ) : null}
                    </div>
                    <span className="text-xs font-semibold text-amber-700">
                      Ver
                    </span>
                  </div>
                </Card>
              </a>
            );
          })}
        </div>
      ) : (
        <Card>
          <p className="text-sm text-slate-600">Carregando…</p>
        </Card>
      )}
    </div>
  );
}

