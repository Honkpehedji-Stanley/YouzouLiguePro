"use client";

import { useEffect, useRef, useState } from "react";
import { BENIN_COMMUNES_BY_DEPARTMENT, NATIONALITIES, isBeninNationality } from "@/lib/geo";
import { inputClass, selectClass, labelClass, linkButtonClass } from "./formStyles";

const ALL_COMMUNES = new Set(Object.values(BENIN_COMMUNES_BY_DEPARTMENT).flat());

function NationalitySelect({
  name,
  label,
  value,
  onChange,
  allowEmpty,
}: {
  name: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  allowEmpty?: boolean;
}) {
  const knownMatch = NATIONALITIES.some((n) => n.value === value);
  const [custom, setCustom] = useState(!!value && !knownMatch);

  return (
    <div>
      <div className="flex items-center justify-between">
        <label className={labelClass} htmlFor={name}>
          {label}
        </label>
        <button
          type="button"
          className={linkButtonClass}
          onClick={() => {
            setCustom((v) => !v);
            onChange("");
          }}
        >
          {custom ? "Revenir à la liste" : "Autre (saisie libre)"}
        </button>
      </div>
      {custom ? (
        <input
          id={name}
          name={name}
          defaultValue={value}
          onChange={(e) => onChange(e.target.value)}
          className={inputClass}
          placeholder={label}
        />
      ) : (
        <select
          id={name}
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={selectClass}
        >
          <option value="">{allowEmpty ? "Aucune" : "— Sélectionner —"}</option>
          {NATIONALITIES.map((n) => (
            <option key={n.value} value={n.value}>
              {n.value} ({n.country})
            </option>
          ))}
        </select>
      )}
    </div>
  );
}

export function NationalityAndHometownFields({
  defaultNationality,
  defaultNationality2,
  defaultHometown,
}: {
  defaultNationality: string;
  defaultNationality2: string;
  defaultHometown: string;
}) {
  const [nationality, setNationality] = useState(defaultNationality);
  const [nationality2, setNationality2] = useState(defaultNationality2);

  const isBenin = isBeninNationality(nationality);
  const knownCommune = ALL_COMMUNES.has(defaultHometown);
  const [hometownCustom, setHometownCustom] = useState(!isBenin || (!!defaultHometown && !knownCommune));

  const previousIsBenin = useRef(isBenin);
  useEffect(() => {
    if (previousIsBenin.current !== isBenin) {
      setHometownCustom(!isBenin);
      previousIsBenin.current = isBenin;
    }
  }, [isBenin]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-3">
        <div className="w-1/2">
          <NationalitySelect name="nationality" label="Nationalité" value={nationality} onChange={setNationality} />
        </div>
        <div className="w-1/2">
          <NationalitySelect
            name="nationality2"
            label="Seconde nationalité"
            value={nationality2}
            onChange={setNationality2}
            allowEmpty
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <label className={labelClass} htmlFor="hometown">
            Ville natale
          </label>
          {isBenin && (
            <button type="button" className={linkButtonClass} onClick={() => setHometownCustom((v) => !v)}>
              {hometownCustom ? "Choisir une commune" : "Autre (saisie libre)"}
            </button>
          )}
        </div>
        {hometownCustom || !isBenin ? (
          <input
            id="hometown"
            name="hometown"
            defaultValue={defaultHometown}
            className={inputClass}
            placeholder={isBenin ? "Commune, ville..." : "Ville, région, pays"}
          />
        ) : (
          <select id="hometown" name="hometown" defaultValue={defaultHometown} className={selectClass}>
            <option value="">— Sélectionner une commune —</option>
            {Object.entries(BENIN_COMMUNES_BY_DEPARTMENT).map(([department, communes]) => (
              <optgroup key={department} label={department}>
                {communes.map((commune) => (
                  <option key={commune} value={commune}>
                    {commune}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        )}
      </div>
    </div>
  );
}
