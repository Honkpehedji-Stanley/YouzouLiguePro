"use client";

import { useFormStatus } from "react-dom";

// Bouton de soumission pour une action destructrice : demande confirmation
// avant de laisser partir la requête, et affiche un état de chargement.
export function ConfirmSubmitButton({
  children,
  confirmMessage,
  pendingText = "Suppression…",
  className,
}: {
  children: React.ReactNode;
  confirmMessage: string;
  pendingText?: string;
  className: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className={className}
      onClick={(event) => {
        if (!window.confirm(confirmMessage)) {
          event.preventDefault();
        }
      }}
    >
      {pending ? pendingText : children}
    </button>
  );
}
