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
      const matchesSearch = searchQuery === '' ||
        model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        model.description.toLowerCase().includes(searchQuery.toLowerCase());
      const sizeInGb = parseFloat(model.size.replace('~', '').replace(',', '.'));
      const matchesVram = isNaN(sizeInGb) || sizeInGb <= maxVram;
      return matchesFamily && matchesSearch && matchesVram;
    });

    // Sort: loaded first, then cached, then the rest
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
