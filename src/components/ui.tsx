import React, { useEffect, useId, useRef } from "react";
import { X } from "lucide-react";

export function SectionTitle({
  title,
  action,
  hint,
}: {
  title: string;
  action?: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="mb-2.5 flex items-end justify-between gap-3">
      <div>
        <h2 className="h-sec ink">{title}</h2>
        {hint && <p className="ink-3 mt-0.5 text-xs">{hint}</p>}
      </div>
      {action && <div className="shrink-0 whitespace-nowrap">{action}</div>}
    </div>
  );
}

export type Tono = "ok" | "warn" | "bad" | "info" | "brand" | "neutral";

const TONO_CLASS: Record<Tono, string> = {
  ok: "chip chip-ok",
  warn: "chip chip-warn",
  bad: "chip chip-bad",
  info: "chip chip-info",
  brand: "chip chip-brand",
  neutral: "chip",
};

export function Chip({
  children,
  tono = "neutral",
  className = "",
}: {
  children: React.ReactNode;
  tono?: Tono;
  className?: string;
}) {
  const base = TONO_CLASS[tono];
  const extra =
    tono === "neutral"
      ? " bg-[var(--surface-3)] text-[var(--ink-2)]"
      : "";
  return <span className={`${base}${extra} ${className}`}>{children}</span>;
}

export function Ring({
  value,
  size = 48,
  stroke = 5,
  tono,
  children,
  label,
}: {
  value: number; // 0..1
  size?: number;
  stroke?: number;
  tono?: Tono;
  children?: React.ReactNode;
  label?: string;
}) {
  const pct = Math.max(0, Math.min(1, value));
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const color =
    tono === "ok"
      ? "var(--ok)"
      : tono === "warn"
        ? "var(--warn)"
        : tono === "bad"
          ? "var(--bad)"
          : tono === "info"
            ? "var(--info)"
            : tono === "brand"
              ? "var(--brand)"
              : pct > 0.35
                ? "var(--ok)"
                : pct > 0.15
                  ? "var(--warn)"
                  : "var(--bad)";
  return (
    <div
      className="relative inline-flex shrink-0 items-center justify-center"
      style={{ width: size, height: size }}
      role="img"
      aria-label={label ?? `Vida útil ${Math.round(pct * 100)}%`}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--surface-3)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
          style={{ transition: "stroke-dashoffset .6s cubic-bezier(.16,1,.3,1), stroke .3s" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {children ?? (
          <span className="nums text-[0.72rem] font-bold" style={{ color }}>
            {Math.round(pct * 100)}%
          </span>
        )}
      </div>
    </div>
  );
}

export function Bar({ value, tono = "brand" }: { value: number; tono?: Tono }) {
  const color =
    tono === "ok"
      ? "var(--ok)"
      : tono === "warn"
        ? "var(--warn)"
        : tono === "bad"
          ? "var(--bad)"
          : tono === "info"
            ? "var(--info)"
            : "var(--brand)";
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full" style={{ background: "var(--surface-3)" }}>
      <div
        className="h-full rounded-full transition-[width] duration-700"
        style={{ width: `${Math.max(2, Math.min(100, value * 100))}%`, background: color }}
      />
    </div>
  );
}

export function Stat({
  label,
  value,
  hint,
  icon,
  tono = "neutral",
}: {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  icon?: React.ReactNode;
  tono?: Tono;
}) {
  const color =
    tono === "ok"
      ? "var(--ok)"
      : tono === "warn"
        ? "var(--warn)"
        : tono === "bad"
          ? "var(--bad)"
          : tono === "brand"
            ? "var(--brand)"
            : "var(--ink)";
  return (
    <div className="card-flat p-3.5">
      <div className="ink-2 flex items-center gap-1.5 text-[0.72rem] font-semibold uppercase tracking-wide">
        {icon}
        {label}
      </div>
      <div className="nums mt-1 text-lg font-bold" style={{ color }}>
        {value}
      </div>
      {hint && <div className="ink-3 mt-0.5 text-xs">{hint}</div>}
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="card flex flex-col items-center gap-2 px-6 py-10 text-center">
      {icon && (
        <div
          className="mb-1 flex h-12 w-12 items-center justify-center rounded-2xl"
          style={{ background: "var(--brand-soft)", color: "var(--brand)" }}
        >
          {icon}
        </div>
      )}
      <h3 className="ink text-[0.98rem] font-semibold">{title}</h3>
      {description && <p className="ink-2 max-w-sm text-sm leading-relaxed">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  wide = false,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  wide?: boolean;
}) {
  const id = useId();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    ref.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby={id}
    >
      <div
        className="absolute inset-0 bg-black/45 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={ref}
        tabIndex={-1}
        className={`pop relative max-h-[92dvh] w-full overflow-y-auto rounded-t-3xl border border-[var(--line)] bg-[var(--surface)] shadow-2xl sm:rounded-3xl ${
          wide ? "sm:max-w-2xl" : "sm:max-w-md"
        }`}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-[var(--line)] bg-[var(--surface)]/95 px-4 py-3 backdrop-blur">
          <h2 id={id} className="ink text-[1rem] font-bold">
            {title}
          </h2>
          <button className="icon-btn" onClick={onClose} aria-label="Cerrar">
            <X size={17} />
          </button>
        </div>
        <div className="px-4 py-4">{children}</div>
        {footer && (
          <div className="sticky bottom-0 border-t border-[var(--line)] bg-[var(--surface)]/95 px-4 py-3 backdrop-blur">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export function Field({
  label,
  children,
  hint,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
  className?: string;
}) {
  return (
    <label className={`field ${className}`}>
      <span className="label">{label}</span>
      {children}
      {hint && <span className="ink-3 mt-1 text-[0.7rem]">{hint}</span>}
    </label>
  );
}

export function Segmented<T extends string>({
  value,
  options,
  onChange,
  size = "md",
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
  size?: "sm" | "md";
}) {
  return (
    <div
      className="inline-flex w-full gap-1 rounded-2xl p-1"
      style={{ background: "var(--surface-3)" }}
      role="tablist"
    >
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(o.value)}
            className={`flex-1 rounded-xl font-semibold transition-all ${
              size === "sm" ? "px-2 py-1.5 text-xs" : "px-3 py-2 text-[0.82rem]"
            }`}
            style={{
              background: active ? "var(--surface)" : "transparent",
              color: active ? "var(--ink)" : "var(--ink-2)",
              boxShadow: active ? "0 1px 3px rgb(15 23 42 / .12)" : "none",
            }}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

export function Row({
  icon,
  title,
  subtitle,
  right,
  onClick,
  className = "",
}: {
  icon?: React.ReactNode;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  right?: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  const Comp = onClick ? "button" : "div";
  return (
    <Comp
      onClick={onClick}
      className={`flex w-full items-center gap-3 text-left ${onClick ? "cursor-pointer" : ""} ${className}`}
    >
      {icon}
      <div className="min-w-0 flex-1">
        <div className="ink truncate text-[0.9rem] font-semibold">{title}</div>
        {subtitle && <div className="ink-2 truncate text-xs">{subtitle}</div>}
      </div>
      {right}
    </Comp>
  );
}
