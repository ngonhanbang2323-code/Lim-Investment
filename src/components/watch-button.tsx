"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { addToWatchlist, removeFromWatchlist } from "@/app/actions/watchlist";
import { Star } from "./icons";

type Props = {
  symbol: string;
  initial: boolean;
  signedIn: boolean;
  loginHref: string;
  labels: { add: string; added: string; login: string };
};

export function WatchButton({ symbol, initial, signedIn, loginHref, labels }: Props) {
  const [watching, setWatching] = useState(initial);
  const [pending, start] = useTransition();
  const cls =
    "inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-md border px-4 text-sm font-semibold transition-colors disabled:opacity-60";

  if (!signedIn) {
    return (
      <Link href={loginHref} className={`${cls} border-line-strong bg-surface text-ink hover:border-forest hover:text-forest`}>
        <Star size={18} /> {labels.login}
      </Link>
    );
  }
  return (
    <button
      type="button"
      aria-pressed={watching}
      disabled={pending}
      onClick={() =>
        start(async () => {
          const next = !watching;
          setWatching(next);
          const res = await (next ? addToWatchlist(symbol) : removeFromWatchlist(symbol));
          if (!res.ok) setWatching(!next);
        })
      }
      className={`${cls} ${
        watching ? "border-forest bg-forest-soft text-forest" : "border-line-strong bg-surface text-ink hover:border-forest hover:text-forest"
      }`}
    >
      <Star size={18} fill={watching ? "currentColor" : "none"} />
      {watching ? labels.added : labels.add}
    </button>
  );
}
