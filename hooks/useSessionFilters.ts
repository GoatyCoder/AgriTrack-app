import { useMemo, useState } from 'react';
import { Articolo, Lavorazione, SiglaLotto } from '../types';

interface UseSessionFiltersParams {
  sessioni: Lavorazione[];
  activeSessioneProduzioneId: string | null;
  articoli: Articolo[];
  sigleLotto: SiglaLotto[];
}

export const useSessionFilters = ({ sessioni, activeSessioneProduzioneId, articoli, sigleLotto }: UseSessionFiltersParams) => {
  const [showFilters, setShowFilters] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>({ key: 'inizio', direction: 'desc' });
  const [filters, setFilters] = useState({ linea: '', articolo: '', lotto: '', stato: '', note: '' });
  const [timeFilter, setTimeFilter] = useState<{ mode: 'AFTER' | 'BEFORE' | 'RANGE'; start: string; end: string }>({
    mode: 'RANGE',
    start: '',
    end: ''
  });

  const shiftSessionsHistoryRaw = useMemo(
    () => sessioni.filter(s => s.sessioneProduzioneId === activeSessioneProduzioneId),
    [sessioni, activeSessioneProduzioneId]
  );

  const processedSessions = useMemo(() => {
    let data = shiftSessionsHistoryRaw.map(s => ({
      ...s,
      articoloNome: articoli.find(a => a.id === s.articoloId)?.nome || '',
      lottoCodice: sigleLotto.find(l => l.id === s.siglaLottoId)?.code || '',
      stato: s.status
    }));

    if (filters.linea) data = data.filter(s => s.lineaId === filters.linea);
    if (filters.articolo) data = data.filter(s => s.articoloNome.toLowerCase().includes(filters.articolo.toLowerCase()));
    if (filters.lotto) data = data.filter(s => s.lottoCodice.toLowerCase().includes(filters.lotto.toLowerCase()));
    if (filters.stato) data = data.filter(s => s.stato === filters.stato);
    if (filters.note) data = data.filter(s => (s.note || '').toLowerCase().includes(filters.note.toLowerCase()));

    if (timeFilter.start) {
      data = data.filter(s => {
        const sessionTime = new Date(s.inizio).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
        if (timeFilter.mode === 'AFTER') return sessionTime >= timeFilter.start;
        if (timeFilter.mode === 'BEFORE') return sessionTime <= timeFilter.start;
        if (timeFilter.mode === 'RANGE') {
          if (!timeFilter.end) return sessionTime >= timeFilter.start;
          return sessionTime >= timeFilter.start && sessionTime <= timeFilter.end;
        }
        return true;
      });
    }

    if (sortConfig) {
      data.sort((a: any, b: any) => {
        const valA = a[sortConfig.key];
        const valB = b[sortConfig.key];
        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return data;
  }, [shiftSessionsHistoryRaw, articoli, sigleLotto, filters, sortConfig, timeFilter]);

  const hasActiveFilters = Object.values(filters).some(v => v !== '') || !!timeFilter.start;

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  const resetSort = () => setSortConfig(null);
  const clearFilters = () => {
    setFilters({ linea: '', articolo: '', lotto: '', stato: '', note: '' });
    setTimeFilter({ mode: 'RANGE', start: '', end: '' });
  };

  return {
    showFilters,
    setShowFilters,
    sortConfig,
    setSortConfig,
    filters,
    setFilters,
    timeFilter,
    setTimeFilter,
    processedSessions,
    hasActiveFilters,
    handleSort,
    resetSort,
    clearFilters
  };
};
