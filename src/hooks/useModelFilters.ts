import { useState, useMemo } from 'react';
import type { ModelFamily } from '@services/webllm/IWebllmService';

interface FilterableModel {
  name: string;
  description: string;
  size: string;
  family: ModelFamily;
  downloaded?: boolean;
  isCached?: boolean;
}

/** Parses size strings like "~2.3 GB", "~600 MB (q4)", "1.5 GB" → value in GB */
function parseSizeToGb(sizeStr: string): number {
  const clean = sizeStr.replace('~', '').replace(',', '.');
  const value = parseFloat(clean);
  if (isNaN(value)) return 0;
  if (/MB/i.test(sizeStr)) return value / 1024;
  return value; // already GB
}

export function useModelFilters<T extends FilterableModel>(models: T[]) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFamily, setActiveFamily] = useState<ModelFamily | 'All'>('All');
  const [maxVram, setMaxVram] = useState<number>(16);

  const availableFamilies = useMemo(() => {
    const families = new Set(models.map(m => m.family));
    return Array.from(families).sort() as ModelFamily[];
  }, [models]);

  const filteredModels = useMemo(() => {
    const filtered = models.filter(model => {
      const matchesFamily = activeFamily === 'All' || model.family === activeFamily;
      const matchesSearch =
        searchQuery === '' ||
        model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        model.description.toLowerCase().includes(searchQuery.toLowerCase());
      const sizeInGb = parseSizeToGb(model.size);
      const matchesVram = sizeInGb === 0 || sizeInGb <= maxVram;
      return matchesFamily && matchesSearch && matchesVram;
    });

    // Sort: loaded first, then cached, then rest
    return filtered.sort((a, b) => {
      const aScore = a.downloaded ? 2 : a.isCached ? 1 : 0;
      const bScore = b.downloaded ? 2 : b.isCached ? 1 : 0;
      return bScore - aScore;
    });
  }, [models, activeFamily, searchQuery, maxVram]);

  return {
    searchQuery,
    setSearchQuery,
    activeFamily,
    setActiveFamily,
    maxVram,
    setMaxVram,
    availableFamilies,
    filteredModels,
  };
}
