import { useEffect } from "react";

export function useSaveToLocalStorage<T>(key: string, value: T) {
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);
}
