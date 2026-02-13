import { Dispatch, SetStateAction, useMemo } from 'react';
import { AppState, Pedana, Scarto } from '../types';

export const useProductionRecords = (state: AppState, setState: Dispatch<SetStateAction<AppState>>) => {
  const pedaneTodayCount = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return state.pedane.filter(p => p.timestamp.startsWith(today)).length;
  }, [state.pedane]);

  const handleSavePedana = (pedanaData: Omit<Pedana, 'id' | 'timestamp'>) => {
    const newPedana: Pedana = { ...pedanaData, id: crypto.randomUUID(), timestamp: new Date().toISOString() };
    setState(prev => ({ ...prev, pedane: [...prev.pedane, newPedana] }));
  };

  const handleSaveScarto = (scartoData: Omit<Scarto, 'id' | 'timestamp'>) => {
    const newScarto: Scarto = { ...scartoData, id: crypto.randomUUID(), timestamp: new Date().toISOString() };
    setState(prev => ({ ...prev, scarti: [...prev.scarti, newScarto] }));
  };

  return { pedaneTodayCount, handleSavePedana, handleSaveScarto };
};
