"use client";

import { useActionState, useEffect, useRef } from "react";
import type { Dictionary } from "@/dictionaries/vi";
import { upsertHolding, type HoldingState } from "@/app/actions/portfolio";
import { buttonStyles, inputStyles } from "../ui";

export function HoldingForm({ t, addLabel, symbols }: { t: Dictionary["account"]["portfolio"]; addLabel: string; symbols: string[] }) {
  const [state, action, pending] = useActionState<HoldingState, FormData>(upsertHolding, {});
  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={action} className="grid gap-3 rounded-lg border border-line bg-surface p-4 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-end">
      <label className="text-sm font-medium">
        {t.symbol}
        <input name="symbol" required list="symbols" autoCapitalize="characters" className={`${inputStyles} mt-1.5 uppercase`} />
        <datalist id="symbols">
          {symbols.map((s) => (
            <option key={s} value={s} />
          ))}
        </datalist>
      </label>
      <label className="text-sm font-medium">
        {t.quantity}
        <input name="quantity" required inputMode="numeric" className={`${inputStyles} mt-1.5`} />
      </label>
      <label className="text-sm font-medium">
        {t.avgPrice}
        <input name="avgPrice" required inputMode="numeric" placeholder="25000" className={`${inputStyles} mt-1.5`} />
      </label>
      <button type="submit" disabled={pending} className={buttonStyles.primary}>
        {addLabel}
      </button>
      {state.error && (
        <p role="alert" className="text-sm text-danger sm:col-span-4">
          {t[state.error]}
        </p>
      )}
    </form>
  );
}
