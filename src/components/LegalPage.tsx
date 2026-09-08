import { PageContainer } from "@/components/PageContainer";

export function LegalPage({
  title,
  updatedAt,
  children,
}: {
  title: string;
  updatedAt: string;
  children: React.ReactNode;
}) {
  return (
    <PageContainer>
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-1 text-2xl font-bold">{title}</h1>
        <p className="mb-8 text-sm text-black/50">Dernière mise à jour : {updatedAt}</p>
        <div className="flex flex-col gap-6 text-[15px] leading-relaxed text-black/80">{children}</div>
      </div>
    </PageContainer>
  );
}

export function LegalSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-2 text-lg font-semibold text-black">{title}</h2>
      <div className="flex flex-col gap-3">{children}</div>
    </section>
  );
}
