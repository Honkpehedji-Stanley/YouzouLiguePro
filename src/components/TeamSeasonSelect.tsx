"use client";

import { useRouter } from "next/navigation";

export function TeamSeasonSelect({
  seasons,
  value,
  onglet,
  slug,
}: {
  seasons: { id: string; label: string }[];
  value: string;
  onglet: string;
  slug: string;
}) {
  const router = useRouter();

  return (
    <select
      value={value}
      onChange={(e) => router.push(`/equipes/${slug}?onglet=${onglet}&saison=${e.target.value}`)}
      className="rounded-md border border-black/20 bg-white px-3 py-1.5 text-sm focus:border-brand focus:outline-none"
    >
      {seasons.map((season) => (
        <option key={season.id} value={season.id}>
          {season.label}
        </option>
      ))}
    </select>
  );
}
