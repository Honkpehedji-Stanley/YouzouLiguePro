"use client";

import { useState } from "react";
import { computeAge as computeAgeFromDate } from "@/lib/age";
import { inputClass, labelClass, hintClass } from "./formStyles";

function computeAge(birthDate: string): number | null {
  const parsed = new Date(birthDate);
  if (Number.isNaN(parsed.getTime())) return null;
  return computeAgeFromDate(parsed);
}

export function AgeBirthDateFields({
  defaultBirthDate,
  defaultAge,
}: {
  defaultBirthDate: string;
  defaultAge: number | string | null;
}) {
  const [birthDate, setBirthDate] = useState(defaultBirthDate);
  const [manualAge, setManualAge] = useState(defaultAge != null ? String(defaultAge) : "");

  const computedAge = birthDate ? computeAge(birthDate) : null;
  const displayedAge = birthDate ? (computedAge ?? "") : manualAge;
  const estimatedYear =
    !birthDate && manualAge && !Number.isNaN(Number(manualAge))
      ? new Date().getFullYear() - Number(manualAge)
      : null;

  return (
    <div className="flex gap-3">
      <div className="w-1/2">
        <label className={labelClass} htmlFor="birthDate">
          Date de naissance
        </label>
        <input
          id="birthDate"
          name="birthDate"
          type="date"
          value={birthDate}
          onChange={(e) => setBirthDate(e.target.value)}
          className={inputClass}
        />
        {birthDate && <p className={hintClass}>L&apos;âge est calculé automatiquement.</p>}
      </div>
      <div className="w-1/2">
        <label className={labelClass} htmlFor="age">
          Âge {birthDate ? "(calculé)" : "(si date inconnue)"}
        </label>
        <input
          id="age"
          name="age"
          type="number"
          min={0}
          max={80}
          value={displayedAge}
          readOnly={!!birthDate}
          onChange={(e) => setManualAge(e.target.value)}
          className={inputClass}
        />
        {estimatedYear && <p className={hintClass}>≈ né(e) vers {estimatedYear}</p>}
      </div>
    </div>
  );
}
