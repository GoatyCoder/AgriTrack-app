import { useEffect, useMemo, useState } from 'react';
import { AppState, Lavorazione, SessioneProduzione } from '../types';
import { ArticoloLottoCompatibilityService } from '../core/services/domain/ArticoloLottoCompatibilityService';
import { computeDoy, doyToDate } from '../utils';

const formatDateInput = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const useSessionForm = (
  state: AppState,
  activeSessioneProduzione: SessioneProduzione | undefined,
  sessionToSwitchLotto: Lavorazione | null
) => {
  const today = new Date();

  const [isNewSessionMode, setIsNewSessionMode] = useState(false);
  const [newSessionData, setNewSessionData] = useState<{
    areaId: string;
    lineaId: string;
    articoloId: string;
    siglaLottoId: string;
    dataIngresso: string;
    doyIngresso?: number;
    imballoId: string;
    pesoColloStandard: number;
  }>({
    areaId: state.aree[0]?.id || '',
    lineaId: state.linee[0]?.id || '',
    articoloId: '',
    siglaLottoId: '',
    dataIngresso: formatDateInput(today),
    doyIngresso: computeDoy(today),
    imballoId: '',
    pesoColloStandard: 0
  });

  const compatibilityService = useMemo(() => new ArticoloLottoCompatibilityService(), []);

  useEffect(() => {
    if (!activeSessioneProduzione) return;
    const firstLineaArea = state.linee.find(l => l.areaId === activeSessioneProduzione.areaId && l.attiva !== false)?.id || state.linee[0]?.id || '';
    setNewSessionData(prev => ({ ...prev, areaId: activeSessioneProduzione.areaId, lineaId: firstLineaArea || prev.lineaId }));
  }, [activeSessioneProduzione, state.linee]);

  const selectedLotto = state.sigleLotto.find(s => s.id === newSessionData.siglaLottoId);
  const selectedLottoVarieta = selectedLotto ? state.varieta.find(v => v.id === selectedLotto.varietaId) : null;
  const selectedProdotto = selectedLottoVarieta ? state.prodottiGrezzi.find((prodotto) => prodotto.id === selectedLottoVarieta.prodottoId) : null;
  const selectedArticoloForm = state.articoli.find((articolo) => articolo.id === newSessionData.articoloId);

  const filteredArticoli = useMemo(() => state.articoli.filter(art => {
    return compatibilityService.isCompatible(art, selectedLotto, selectedLottoVarieta || undefined);
  }), [state.articoli, selectedLotto, selectedLottoVarieta, compatibilityService]);

  const lottoOptions = useMemo(() => state.sigleLotto.map(s => ({ ...s, codice: s.code, nome: `${s.produttore} (${s.campo})` })), [state.sigleLotto]);
  const imballiOptions = useMemo(
    () => state.imballi.filter((imballo) => imballo.attivo !== false).map((imballo) => ({ ...imballo, codice: imballo.codice, nome: imballo.nome })),
    [state.imballi]
  );

  const compatibleLottoOptions = useMemo(() => {
    if (!sessionToSwitchLotto) return [];
    const currentArt = state.articoli.find(a => a.id === sessionToSwitchLotto.articoloId);
    if (!currentArt) return lottoOptions;

    return compatibilityService.getCompatibleLotti(currentArt, lottoOptions, state.varieta);
  }, [sessionToSwitchLotto, lottoOptions, state.articoli, state.varieta, compatibilityService]);

  const handleSelectLotto = (id: string) => {
    setNewSessionData((prev) => ({ ...prev, siglaLottoId: id, articoloId: '' }));
  };

  const handleSelectArticolo = (id: string) => {
    const articolo = state.articoli.find((item) => item.id === id);
    setNewSessionData((prev) => ({
      ...prev,
      articoloId: id,
      pesoColloStandard: articolo?.pesoColloTeorico ?? prev.pesoColloStandard
    }));
  };

  const handleDataIngressoChange = (dataIngresso: string) => {
    if (!dataIngresso) {
      setNewSessionData((prev) => ({ ...prev, dataIngresso, doyIngresso: undefined }));
      return;
    }

    const parsedDate = new Date(dataIngresso);
    if (Number.isNaN(parsedDate.getTime())) {
      setNewSessionData((prev) => ({ ...prev, dataIngresso }));
      return;
    }

    setNewSessionData((prev) => ({ ...prev, dataIngresso, doyIngresso: computeDoy(parsedDate) }));
  };

  const handleDoyIngressoChange = (inputValue: string) => {
    const normalized = parseInt(inputValue, 10);
    if (Number.isNaN(normalized)) {
      setNewSessionData((prev) => ({ ...prev, doyIngresso: undefined, dataIngresso: '' }));
      return;
    }

    const currentYear = new Date().getFullYear();
    const isLeapYear = new Date(currentYear, 1, 29).getDate() === 29;
    const maxDoy = isLeapYear ? 366 : 365;
    if (normalized < 1 || normalized > maxDoy) {
      setNewSessionData((prev) => ({ ...prev, doyIngresso: normalized }));
      return;
    }

    const convertedDate = doyToDate(normalized, currentYear);
    setNewSessionData((prev) => ({
      ...prev,
      doyIngresso: normalized,
      dataIngresso: formatDateInput(convertedDate)
    }));
  };

  return {
    isNewSessionMode,
    setIsNewSessionMode,
    newSessionData,
    setNewSessionData,
    lottoOptions,
    filteredArticoli,
    compatibleLottoOptions,
    selectedLottoVarieta,
    selectedProdotto,
    selectedArticoloForm,
    imballiOptions,
    handleSelectLotto,
    handleSelectArticolo,
    handleDataIngressoChange,
    handleDoyIngressoChange
  };
};
