import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import type { Locale } from "@/lib/i18n-config";
import { fmtDate } from "@/lib/format";

export function Container({ className = "", children }: { className?: string; children: ReactNode }) {
  return <div className={`mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 ${className}`}>{children}</div>;
}

export function PageHeader({ title, lead, children }: { title: string; lead?: string; children?: ReactNode }) {
  return (
    <div className="border-b border-line">
      <Container className="py-14 sm:py-20">
        <h1 className="max-w-3xl font-display text-h1 text-forest">{title}</h1>
        {lead && <p className="mt-5 max-w-2xl text-lg text-ink-muted">{lead}</p>}
        {children}
      </Container>
    </div>
  );
}

const buttonBase =
  "inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-md px-5 font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60";
export const buttonStyles = {
  primary: `${buttonBase} bg-forest text-on-forest hover:bg-forest-hover`,
  secondary: `${buttonBase} border border-line-strong bg-surface text-ink hover:border-forest hover:text-forest`,
  onDark: `${buttonBase} bg-white text-forest-deep hover:bg-white/85`,
  ghostOnDark: `${buttonBase} border border-white/35 text-white hover:border-white hover:bg-white/10`,
  danger: `${buttonBase} border border-line-strong bg-surface text-danger hover:border-danger`,
};

export function ButtonLink({ variant = "primary", className = "", ...props }: ComponentProps<typeof Link> & { variant?: keyof typeof buttonStyles }) {
  return <Link className={`${buttonStyles[variant]} ${className}`} {...props} />;
}

export function SampleBadge({ label, note }: { label: string; note: string }) {
  return (
    <span
      title={note}
      className="inline-flex items-center gap-1.5 rounded-full border border-current/30 px-2.5 py-0.5 text-xs font-medium opacity-90"
    >
      <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
      {label}
      <span className="sr-only">: {note}</span>
    </span>
  );
}

export const inputStyles =
  "block w-full min-h-11 rounded-md border border-line-strong bg-surface px-3 py-2 text-base text-ink placeholder:text-ink-muted/70 focus:border-forest focus:outline-none focus:ring-2 focus:ring-forest/20 aria-[invalid=true]:border-danger";

export function Field({
  label,
  htmlFor,
  hint,
  error,
  children,
  optionalLabel,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  error?: string;
  children: ReactNode;
  optionalLabel?: string;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-ink">
        {label}
        {optionalLabel && <span className="ml-1.5 font-normal text-ink-muted">({optionalLabel})</span>}
      </label>
      {children}
      {hint && !error && (
        <p id={`${htmlFor}-hint`} className="mt-1.5 text-sm text-ink-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${htmlFor}-error`} className="mt-1.5 text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

type DataSource = { kind: "sample" } | { kind: "snapshot"; source: string; asOf: string; intraday: boolean };
type DataText = { sampleData: string; sampleDataNote: string; dataSource: string; intraday: string; realDataNote: string };

/** Where market figures come from: the real snapshot (with its time) or sample data. */
export function DataBadge({ source, text, lang }: { source: DataSource; text: DataText; lang: Locale }) {
  if (source.kind === "sample") return <SampleBadge label={text.sampleData} note={text.sampleDataNote} />;
  const time = fmtDate(source.asOf, lang, { dateStyle: "short", timeStyle: "short" });
  const label = text.dataSource.replace("{source}", source.source).replace("{time}", time);
  return (
    <span title={text.realDataNote} className="inline-flex items-center gap-1.5 rounded-full border border-current/30 px-2.5 py-0.5 text-xs font-medium opacity-90">
      <span className="size-1.5 rounded-full bg-tone-up" aria-hidden="true" />
      {label}
      {source.intraday && <span className="opacity-75">({text.intraday})</span>}
    </span>
  );
}

export function dataNote(source: DataSource, text: DataText) {
  return source.kind === "sample" ? text.sampleDataNote : text.realDataNote;
}
