import { useEffect, useMemo, useState } from 'react';
import { AppState, Lavorazione, SessioneProduzione } from '../types';
import { ArticoloLottoCompatibilityService } from '../core/services/domain/ArticoloLottoCompatibilityService';

export const useSessionForm = (
  state: AppState,
  activeSessioneProduzione: SessioneProduzione | undefined,
  sessionToSwitchLotto: Lavorazione | null
) => {
  const [isNewSessionMode, setIsNewSessionMode] = useState(false);
  const [newSessionData, setNewSessionData] = useState({
    areaId: state.aree[0]?.id || '',
    lineaId: state.linee[0]?.id || '',
    articoloId: '',
    siglaLottoId: '',
    dataIngresso: new Date().toISOString().split('T')[0]
  });

  const compatibilityService = useMemo(() => new ArticoloLottoCompatibilityService(), []);

  useEffect(() => {
    if (!activeSessioneProduzione) return;
    const firstLineaArea = state.linee.find(l => l.areaId === activeSessioneProduzione.areaId && l.attiva !== false)?.id || state.linee[0]?.id || '';
    setNewSessionData(prev => ({ ...prev, areaId: activeSessioneProduzione.areaId, lineaId: firstLineaArea || prev.lineaId }));
  }, [activeSessioneProduzione, state.linee]);

  const selectedLotto = state.sigleLotto.find(s => s.id === newSessionData.siglaLottoId);
  const selectedLottoVarieta = selectedLotto ? state.varieta.find(v => v.id === selectedLotto.varietaId) : null;

  const filteredArticoli = useMemo(() => state.articoli.filter(art => {
    return compatibilityService.isCompatible(art, selectedLotto, selectedLottoVarieta || undefined);
  }), [state.articoli, selectedLotto, selectedLottoVarieta, compatibilityService]);

  const lottoOptions = useMemo(() => state.sigleLotto.map(s => ({ ...s, codice: s.code, nome: `${s.produttore} (${s.campo})` })), [state.sigleLotto]);

  const compatibleLottoOptions = useMemo(() => {
    if (!sessionToSwitchLotto) return [];
    const currentArt = state.articoli.find(a => a.id === sessionToSwitchLotto.articoloId);
    if (!currentArt) return lottoOptions;

    return compatibilityService.getCompatibleLotti(currentArt, lottoOptions, state.varieta);
  }, [sessionToSwitchLotto, lottoOptions, state.articoli, state.varieta, compatibilityService]);

  return {
    isNewSessionMode,
    setIsNewSessionMode,
    newSessionData,
    setNewSessionData,
    lottoOptions,
    filteredArticoli,
    compatibleLottoOptions
  };
};
