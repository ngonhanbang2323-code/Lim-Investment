// Mark: three offset growth rings, the same motif as the home page hero.
export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg width="30" height="30" viewBox="0 0 32 32" aria-hidden="true" fill="none" stroke="currentColor">
        <circle cx="15" cy="17" r="13" strokeWidth="1.6" />
        <circle cx="15.6" cy="16.4" r="8.6" strokeWidth="1.6" />
        <circle cx="16.2" cy="15.8" r="4.2" strokeWidth="1.6" />
        <circle cx="16.6" cy="15.4" r="1.2" fill="currentColor" stroke="none" />
      </svg>
      <span className="font-display text-[1.35rem] leading-none tracking-tight">
        Lim <span className="text-[0.95em] opacity-80">Investment</span>
      </span>
    </span>
  );
}
