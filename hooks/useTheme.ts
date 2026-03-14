"use client";

import { useCallback, useEffect, useMemo, useSyncExternalStore } from "react";

type Theme = "light" | "dark";
type ThemePreference = Theme | "system";
type ThemeSnapshot = {
  preference: ThemePreference;
  resolvedTheme: Theme;
};

const THEME_STORAGE_KEY = "sopsmith-theme";
const THEME_EVENT = "sopsmith-theme-change";

function getSystemTheme(): Theme {
  if (typeof window === "undefined") {
    return "dark";
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function getStoredThemePreference(): ThemePreference {
  if (typeof window === "undefined") {
    return "system";
  }

  const stored = window.localStorage.getItem(THEME_STORAGE_KEY);

  return stored === "light" || stored === "dark" ? stored : "system";
}

function getSnapshot(): ThemeSnapshot {
  const preference = getStoredThemePreference();

  return {
    preference,
    resolvedTheme: preference === "system" ? getSystemTheme() : preference,
  };
}

function getServerSnapshot(): ThemeSnapshot {
  return {
    preference: "system",
    resolvedTheme: "dark",
  };
}

function subscribe(onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  const handleChange = () => onStoreChange();

  mediaQuery.addEventListener("change", handleChange);
  window.addEventListener("storage", handleChange);
  window.addEventListener(THEME_EVENT, handleChange);

  return () => {
    mediaQuery.removeEventListener("change", handleChange);
    window.removeEventListener("storage", handleChange);
    window.removeEventListener(THEME_EVENT, handleChange);
  };
}

export function useTheme() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const root = window.document.documentElement;

    if (snapshot.preference === "system") {
      root.removeAttribute("data-theme");
    } else {
      root.setAttribute("data-theme", snapshot.preference);
    }

    root.style.colorScheme = snapshot.resolvedTheme;
  }, [snapshot.preference, snapshot.resolvedTheme]);

  const setThemePreference = useCallback((nextPreference: ThemePreference) => {
    if (typeof window === "undefined") {
      return;
    }

    if (nextPreference === "system") {
      window.localStorage.removeItem(THEME_STORAGE_KEY);
    } else {
      window.localStorage.setItem(THEME_STORAGE_KEY, nextPreference);
    }

    window.dispatchEvent(new Event(THEME_EVENT));
  }, []);

  const toggleTheme = useCallback(() => {
    setThemePreference(snapshot.resolvedTheme === "dark" ? "light" : "dark");
  }, [setThemePreference, snapshot.resolvedTheme]);

  return useMemo(
    () => ({
      preference: snapshot.preference,
      resolvedTheme: snapshot.resolvedTheme,
      setThemePreference,
      toggleTheme,
    }),
    [setThemePreference, snapshot.preference, snapshot.resolvedTheme, toggleTheme],
  );
}
