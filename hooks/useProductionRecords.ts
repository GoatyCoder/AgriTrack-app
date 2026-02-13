import { Dispatch, SetStateAction, useMemo } from 'react';
import { ProductionValidationService } from '../core/services/domain/ProductionValidationService';
import { AppState, Pedana, Scarto } from '../types';

export const useProductionRecords = (state: AppState, setState: Dispatch<SetStateAction<AppState>>) => {
  const validationService = useMemo(() => new ProductionValidationService(), []);
  const pedaneTodayCount = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return state.pedane.filter(p => p.timestamp.startsWith(today)).length;
  }, [state.pedane]);

  const handleSavePedana = (pedanaData: Omit<Pedana, 'id' | 'timestamp'>) => {
    validationService.ensurePositive(pedanaData.numeroColli, 'Numero colli');
    validationService.ensurePositive(pedanaData.pesoTotale, 'Peso totale');
    const newPedana: Pedana = { ...pedanaData, id: crypto.randomUUID(), timestamp: new Date().toISOString() };
    setState(prev => ({ ...prev, pedane: [...prev.pedane, newPedana] }));
  };

  const handleSaveScarto = (scartoData: Omit<Scarto, 'id' | 'timestamp'>) => {
    validationService.ensurePositive(scartoData.peso, 'Peso scarto');
    const newScarto: Scarto = { ...scartoData, id: crypto.randomUUID(), timestamp: new Date().toISOString() };
    setState(prev => ({ ...prev, scarti: [...prev.scarti, newScarto] }));
  };

  return { pedaneTodayCount, handleSavePedana, handleSaveScarto };
};
