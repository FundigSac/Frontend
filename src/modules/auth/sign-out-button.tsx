import { signOutAction } from "./actions";
import { BTN_SECONDARY } from "./ui/styles";

/** Formulario POST (Server Action): funciona incluso sin JavaScript. */
export function SignOutButton({ variant = "link" }: { variant?: "link" | "secondary" }) {
  return (
    <form action={signOutAction}>
      {variant === "secondary" ? (
        <button type="submit" className={BTN_SECONDARY}>
          <span aria-hidden="true" className="material-symbols-outlined text-[18px]">
            logout
          </span>
          Cerrar sesión
        </button>
      ) : (
        <button type="submit" className="inline-flex h-11 items-center gap-1.5 rounded-lg px-3 font-button-text text-button-text text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors">
          <span aria-hidden="true" className="material-symbols-outlined text-[18px]">
            logout
          </span>
          Cerrar sesión
        </button>
      )}
    </form>
  );
}
