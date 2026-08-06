import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import Image from "next/image";
import { signIn } from "@/lib/auth";
import { inputClass, labelClass, primaryButtonClass } from "@/components/admin/formStyles";

async function loginAction(formData: FormData) {
  "use server";

  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/admin",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      redirect("/admin/login?error=1");
    }
    throw error;
  }
}

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <Image src="/logo.jpg" alt="Youzou Ligue Pro" width={48} height={48} className="mb-3 rounded-lg" />
          <h1 className="text-lg font-bold">
            <span className="text-brand">Youzou</span> Ligue Pro — Admin
          </h1>
          <p className="mt-1 text-sm text-slate-500">Connecte-toi pour accéder au tableau de bord.</p>
        </div>
        <form action={loginAction} className="flex flex-col gap-4">
          <div>
            <label htmlFor="email" className={labelClass}>
              Email
            </label>
            <input id="email" name="email" type="email" required autoFocus className={inputClass} />
          </div>
          <div>
            <label htmlFor="password" className={labelClass}>
              Mot de passe
            </label>
            <input id="password" name="password" type="password" required className={inputClass} />
          </div>
          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
              Email ou mot de passe incorrect.
            </p>
          )}
          <button type="submit" className={`${primaryButtonClass} mt-1 w-full`}>
            Se connecter
          </button>
        </form>
      </div>
    </div>
  );
}
