"use client";

import { useEffect } from "react";
import Link from "next/link";
import { primaryButtonClass } from "@/components/admin/formStyles";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-md py-16 text-center">
      <p className="text-4xl">⚠️</p>
      <h1 className="mt-4 text-xl font-bold">Une erreur est survenue</h1>
      <p className="mt-2 text-sm text-slate-500">
        {error.message || "L'opération n'a pas pu être effectuée. Vos autres données n'ont pas été affectées."}
      </p>
      <div className="mt-6 flex justify-center gap-3">
        <button type="button" onClick={reset} className={primaryButtonClass}>
          Réessayer
        </button>
        <Link
          href="/admin"
          className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
        >
          Retour au tableau de bord
        </Link>
      </div>
    </div>
  );
}
