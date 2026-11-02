import { useEffect } from "react";
import { X } from "lucide-react";

export function Sheet({
  open,
  titulo,
  sub,
  onClose,
  children,
}: {
  open: boolean;
  titulo: string;
  sub?: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-[var(--bg)]">
      <header className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-[var(--line)] bg-[var(--surface)]/95 px-4 py-3 backdrop-blur">
        <div className="min-w-0">
          <h2 className="ink truncate text-[1rem] font-extrabold tracking-tight">{titulo}</h2>
          {sub && <p className="ink-3 truncate text-[0.68rem]">{sub}</p>}
        </div>
        <button className="icon-btn" onClick={onClose} aria-label="Cerrar">
          <X size={17} />
        </button>
      </header>
      <div className="mx-auto w-full max-w-5xl flex-1 overflow-y-auto px-4 pb-24 pt-4">{children}</div>
    </div>
  );
}
