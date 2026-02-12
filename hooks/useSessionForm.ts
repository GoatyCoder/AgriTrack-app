import { useEffect, useMemo, useState } from 'react';
import { AppState, SessioneLinea, Turno } from '../types';

export const useSessionForm = (state: AppState, activeTurno: Turno | undefined) => {
  const [isNewSessionMode, setIsNewSessionMode] = useState(false);
  const [newSessionData, setNewSessionData] = useState({
    areaId: state.aree[0]?.id || '',
    lineaId: state.linee[0]?.id || '',
    articoloId: '',
    siglaLottoId: '',
    dataIngresso: new Date().toISOString().split('T')[0]
  });

  const [sessionToSwitchLotto, setSessionToSwitchLotto] = useState<SessioneLinea | null>(null);
  const [switchLottoData, setSwitchLottoData] = useState({
    siglaLottoId: '',
    dataIngresso: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    if (!activeTurno) return;
    const firstLineaArea = state.linee.find(l => l.areaId === activeTurno.areaId && l.attiva !== false)?.id || state.linee[0]?.id || '';
    setNewSessionData(prev => ({ ...prev, areaId: activeTurno.areaId, lineaId: firstLineaArea || prev.lineaId }));
  }, [activeTurno, state.linee]);

  const selectedLotto = state.sigleLotto.find(s => s.id === newSessionData.siglaLottoId);
  const selectedLottoVarieta = selectedLotto ? state.varieta.find(v => v.id === selectedLotto.varietaId) : null;

  const filteredArticoli = useMemo(() => state.articoli.filter(art => {
    if (!art.prodottoId) return true;
    if (!selectedLottoVarieta) return false;
    if (art.prodottoId !== selectedLottoVarieta.prodottoId) return false;
    if (art.varietaId && art.varietaId !== selectedLottoVarieta.id) return false;
    if (art.categoria && art.categoria !== selectedLottoVarieta.categoria) return false;
    return true;
  }), [state.articoli, selectedLottoVarieta]);

  const lottoOptions = useMemo(() => state.sigleLotto.map(s => ({ ...s, codice: s.code, nome: `${s.produttore} (${s.campo})` })), [state.sigleLotto]);

  const compatibleLottoOptions = useMemo(() => {
    if (!sessionToSwitchLotto) return [];
    const currentArt = state.articoli.find(a => a.id === sessionToSwitchLotto.articoloId);
    if (!currentArt) return lottoOptions;

    return lottoOptions.filter(opt => {
      const v = state.varieta.find(varItem => varItem.id === opt.varietaId);
      if (!v) return false;
      if (currentArt.prodottoId && v.prodottoId !== currentArt.prodottoId) return false;
      if (currentArt.varietaId && v.id !== currentArt.varietaId) return false;
      if (currentArt.categoria && v.categoria !== currentArt.categoria) return false;
      return true;
    });
  }, [sessionToSwitchLotto, lottoOptions, state.articoli, state.varieta]);

  return {
    isNewSessionMode,
    setIsNewSessionMode,
    newSessionData,
    setNewSessionData,
    lottoOptions,
    filteredArticoli,
    sessionToSwitchLotto,
    setSessionToSwitchLotto,
    switchLottoData,
    setSwitchLottoData,
    compatibleLottoOptions
  };
};
