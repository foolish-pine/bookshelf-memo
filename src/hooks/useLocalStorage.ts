import { useEffect, useState } from "react";

const loadValue = <T>(
  key: string,
  initialValue: T,
  validate: (value: unknown) => value is T,
) => {
  try {
    const saved = localStorage.getItem(key);

    if (!saved) return initialValue;

    const parsed: unknown = JSON.parse(saved);

    return validate(parsed) ? parsed : initialValue;
  } catch {
    return initialValue;
  }
};

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  validate: (value: unknown) => value is T,
) {
  const [value, setValue] = useState(() =>
    loadValue(key, initialValue, validate),
  );

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue] as const;
}
