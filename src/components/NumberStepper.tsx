"use client";

import { useRef } from "react";

export function NumberStepper({
  name,
  label,
  defaultValue = 0,
}: {
  name: string;
  label: string;
  defaultValue?: number;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const step = (delta: number) => {
    const input = inputRef.current;
    if (!input) return;
    const current = Number(input.value) || 0;
    input.value = String(Math.max(0, current + delta));
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-[10px] font-medium uppercase text-black/50">
        {label}
      </span>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => step(-1)}
          className="flex h-8 w-8 items-center justify-center rounded bg-black/10 text-base leading-none active:bg-black/20"
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
          className="w-10 rounded border border-black/20 bg-transparent py-1 text-center text-sm"
        />
        <button
          type="button"
          onClick={() => step(1)}
          className="flex h-8 w-8 items-center justify-center rounded bg-black/10 text-base leading-none active:bg-black/20"
          aria-label={`Augmenter ${label}`}
        >
          +
        </button>
      </div>
    </div>
  );
}
