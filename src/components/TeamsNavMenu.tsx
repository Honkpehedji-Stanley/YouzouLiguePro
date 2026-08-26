import Image from "next/image";
import Link from "next/link";
import { CATEGORIES, CATEGORY_LABELS, CONFERENCES, CONFERENCE_LABELS } from "@/lib/league";

export type NavTeam = {
  slug: string;
  name: string;
  logoUrl: string | null;
  category: (typeof CATEGORIES)[number];
  conference: (typeof CONFERENCES)[number] | null;
};

export function TeamsNavMenu({ teams }: { teams: NavTeam[] }) {
  return (
    <div className="group relative">
      <Link href="/equipes" className="flex items-center gap-1 py-3 hover:text-brand">
        Équipes
        <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5 opacity-60">
          <path d="M5.5 7.5 10 12l4.5-4.5" stroke="currentColor" strokeWidth={1.5} fill="none" strokeLinecap="round" />
        </svg>
      </Link>
      <div className="invisible absolute left-1/2 top-full z-40 w-[560px] -translate-x-1/2 pt-2 opacity-0 transition group-hover:visible group-hover:opacity-100">
        <div className="rounded-lg border border-black/10 bg-white p-5 shadow-xl">
          <div className="grid grid-cols-2 gap-6">
            {CATEGORIES.map((category) => (
              <div key={category}>
                <p className="mb-2 text-xs font-bold uppercase tracking-wide text-black/40">
                  {CATEGORY_LABELS[category]}
                </p>
                {CONFERENCES.map((conference) => {
                  const entries = teams.filter((t) => t.category === category && t.conference === conference);
                  if (entries.length === 0) return null;
                  return (
                    <div key={conference} className="mb-3">
                      <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-black/50">
                        Conférence {CONFERENCE_LABELS[conference]}
                      </p>
                      <ul className="grid gap-1">
                        {entries.map((team) => (
                          <li key={team.slug}>
                            <Link
                              href={`/equipes/${team.slug}`}
                              className="flex items-center gap-2 rounded-md px-1.5 py-1 text-sm hover:bg-black/5 hover:text-brand"
                            >
                              {team.logoUrl ? (
                                <Image
                                  src={team.logoUrl}
                                  alt=""
                                  width={20}
                                  height={20}
                                  className="shrink-0 rounded object-cover"
                                />
                              ) : (
                                <span className="h-5 w-5 shrink-0 rounded bg-black/10" />
                              )}
                              {team.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
          <Link
            href="/equipes"
            className="mt-2 block border-t border-black/10 pt-3 text-center text-sm font-semibold text-brand hover:underline"
          >
            Voir toutes les équipes
          </Link>
        </div>
      </div>
    </div>
  );
}
