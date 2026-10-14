export function loadFromLocalStorage<T>(
  key: string,
  initialValue: T,
  validate: (value: unknown) => value is T,
) {
  try {
    const saved = localStorage.getItem(key);

    if (!saved) return initialValue;

    const parsed: unknown = JSON.parse(saved);

    return validate(parsed) ? parsed : initialValue;
  } catch {
    return initialValue;
  }
}
