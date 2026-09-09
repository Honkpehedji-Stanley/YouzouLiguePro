"use client";

import { useEffect } from "react";
import Link from "next/link";
import { PageContainer } from "@/components/PageContainer";

export default function SiteError({
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
    <PageContainer>
      <div className="mx-auto max-w-md py-16 text-center">
        <h1 className="text-xl font-bold">Une erreur est survenue</h1>
        <p className="mt-2 text-sm text-black/60">
          Cette page n&apos;a pas pu s&apos;afficher correctement. Réessaie dans un instant.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="rounded-md bg-brand px-5 py-2 font-semibold text-white hover:bg-brand-dark"
          >
            Réessayer
          </button>
          <Link href="/" className="rounded-md border border-black/20 px-5 py-2 font-semibold hover:bg-black/5">
            Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    </PageContainer>
  );
}
