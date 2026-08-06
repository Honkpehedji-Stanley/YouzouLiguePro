import Link from "next/link";
import Image from "next/image";
import { auth, signOut } from "@/lib/auth";

type NavItem = { href: string; label: string; icon: React.ReactNode };
type NavGroup = { title: string; items: NavItem[] };

function IconHome() {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.8} stroke="currentColor" className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 11.5 12 4l9 7.5M5.5 10v9a1 1 0 0 0 1 1H10v-6h4v6h3.5a1 1 0 0 0 1-1v-9" />
    </svg>
  );
}
function IconUsers() {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.8} stroke="currentColor" className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19v-1.5a3.5 3.5 0 0 0-3.5-3.5h-5A3.5 3.5 0 0 0 3 17.5V19M17.5 19v-1.5a3.5 3.5 0 0 0-2.3-3.29M13 4.6a3 3 0 0 1 0 5.8M9.5 10a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" />
    </svg>
  );
}
function IconTable() {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.8} stroke="currentColor" className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.5 5.5h17M3.5 12h17M3.5 18.5h17M8 5.5v13" />
    </svg>
  );
}
function IconShield() {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.8} stroke="currentColor" className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3.5 5 6v5.5c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6l-7-2.5Z" />
    </svg>
  );
}
function IconCalendarCheck() {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.8} stroke="currentColor" className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 9.5h16M6 5.5h12A1.5 1.5 0 0 1 19.5 7v11A1.5 1.5 0 0 1 18 19.5H6A1.5 1.5 0 0 1 4.5 18V7A1.5 1.5 0 0 1 6 5.5ZM8.5 3.5v3M15.5 3.5v3M9 14l2 2 4-4" />
    </svg>
  );
}
function IconCalendar() {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.8} stroke="currentColor" className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 9.5h16M6 5.5h12A1.5 1.5 0 0 1 19.5 7v11A1.5 1.5 0 0 1 18 19.5H6A1.5 1.5 0 0 1 4.5 18V7A1.5 1.5 0 0 1 6 5.5ZM8.5 3.5v3M15.5 3.5v3" />
    </svg>
  );
}

const NAV_GROUPS: NavGroup[] = [
  {
    title: "Vue d'ensemble",
    items: [{ href: "/admin", label: "Tableau de bord", icon: <IconHome /> }],
  },
  {
    title: "Effectifs",
    items: [
      { href: "/admin/players", label: "Joueurs", icon: <IconUsers /> },
      { href: "/admin/players/bulk", label: "Saisie groupée", icon: <IconTable /> },
      { href: "/admin/teams", label: "Équipes", icon: <IconShield /> },
    ],
  },
  {
    title: "Compétition",
    items: [
      { href: "/admin/seasons", label: "Saisons", icon: <IconCalendarCheck /> },
      { href: "/admin/schedule", label: "Calendrier", icon: <IconCalendar /> },
    ],
  },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    return <div className="mx-auto max-w-md px-4 py-16">{children}</div>;
  }

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-slate-200 bg-white md:flex">
        <Link href="/admin" className="flex items-center gap-2 px-6 py-5">
          <Image src="/logo.jpg" alt="Youzou Ligue Pro" width={32} height={32} className="rounded-md" />
          <span className="text-base font-bold tracking-tight">
            <span className="text-brand">Youzou</span> Admin
          </span>
        </Link>
        <nav className="flex-1 overflow-y-auto px-3 py-2">
          {NAV_GROUPS.map((group) => (
            <div key={group.title} className="mb-5">
              <p className="mb-1.5 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                {group.title}
              </p>
              <div className="flex flex-col gap-0.5">
                {group.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-brand/10 hover:text-brand"
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>
        <div className="border-t border-slate-200 px-4 py-4">
          <p className="truncate text-xs text-slate-400">{session.user?.email}</p>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/admin/login" });
            }}
          >
            <button type="submit" className="mt-1 text-xs font-semibold text-red-600 hover:underline">
              Se déconnecter
            </button>
          </form>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center justify-between gap-3 overflow-x-auto border-b border-slate-200 bg-white px-4 py-2.5 md:hidden">
          <nav className="flex gap-4 text-sm font-medium text-slate-600">
            {NAV_GROUPS.flatMap((g) => g.items).map((item) => (
              <Link key={item.href} href={item.href} className="whitespace-nowrap hover:text-brand">
                {item.label}
              </Link>
            ))}
          </nav>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/admin/login" });
            }}
          >
            <button type="submit" className="whitespace-nowrap text-xs font-semibold text-red-600">
              Déconnexion
            </button>
          </form>
        </div>
        <main className="flex-1 px-4 py-6 md:px-8 md:py-8">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
