"use client";

import { useRef } from "react";

export function NumberStepper({
  name,
  label,
  defaultValue = 0,
  onValueChange,
}: {
  name: string;
  label: string;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const step = (delta: number) => {
    const input = inputRef.current;
    if (!input) return;
    const current = Number(input.value) || 0;
    const next = Math.max(0, current + delta);
    input.value = String(next);
    onValueChange?.(next);
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
        {label}
      </span>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => step(-1)}
          className="flex h-8 w-8 items-center justify-center rounded-md bg-brand/10 text-base leading-none text-brand-dark transition hover:bg-brand/20 active:bg-brand/30"
          aria-label={`Diminuer ${label}`}
        >
          −
        </button>
        <input
          ref={inputRef}
          type="number"
          inputMode="numeric"
          name={name}
          min={0}
          defaultValue={defaultValue}
          onChange={(e) => onValueChange?.(Math.max(0, Number(e.target.value) || 0))}
          className="w-10 rounded-md border border-slate-300 bg-white py-1 text-center text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
        />
        <button
          type="button"
          onClick={() => step(1)}
          className="flex h-8 w-8 items-center justify-center rounded-md bg-brand/10 text-base leading-none text-brand-dark transition hover:bg-brand/20 active:bg-brand/30"
          aria-label={`Augmenter ${label}`}
        >
          +
        </button>
      </div>
    </div>
  );
}
