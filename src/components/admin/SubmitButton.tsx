"use client";

import { useFormStatus } from "react-dom";

// À utiliser uniquement comme descendant direct du <form> qu'il soumet :
// useFormStatus lit l'état du formulaire parent le plus proche dans l'arbre React,
// pas via l'attribut HTML `form="..."` (association invisible pour React).
export function SubmitButton({
  children,
  pendingText = "Enregistrement…",
  className,
  formAction,
}: {
  children: React.ReactNode;
  pendingText?: string;
  className: string;
  formAction?: (formData: FormData) => void | Promise<void>;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      formAction={formAction}
      disabled={pending}
      aria-busy={pending}
      className={className}
    >
      {pending ? pendingText : children}
    </button>
  );
}
