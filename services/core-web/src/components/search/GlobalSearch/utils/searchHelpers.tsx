import React from "react";
import { SEARCH_TYPE_CONFIG } from "./searchConfig";

export const getSearchTypes = (filters: string[], includeQuickFilter?: string | null): string[] | null => {
  const allFilters = includeQuickFilter ? [...filters, includeQuickFilter] : filters;
  const uniqueFilters = [...new Set(allFilters)];
  if (uniqueFilters.length === 0) return null;
  return uniqueFilters.flatMap((f) => SEARCH_TYPE_CONFIG[f]?.types || []);
};

export const highlightMatch = (text: string, search: string): React.ReactNode => {
  if (!search || !text) return text;
  const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`);
  const regex = new RegExp(`(${escapedSearch})`, "gi");
  const parts = text.split(regex);
  return parts.map((part, i) => (regex.test(part) ? <mark key={i}>{part}</mark> : part));
};

export const extractMineGuidFromPath = (pathname: string): string | null => {
  const match = pathname.match(/\/mine-dashboard\/([a-f0-9-]+)/i);
  return match ? match[1] : null;
};
