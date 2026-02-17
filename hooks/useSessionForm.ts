import { useEffect, useMemo, useState } from 'react';
import { AppState, Lavorazione, SessioneProduzione, SiglaLotto } from '../types';
import { ArticoloLottoCompatibilityService } from '../core/services/domain/ArticoloLottoCompatibilityService';
import { computeDoy, doyToDate } from '../utils';

const formatDateInput = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const buildDraftLotto = (code: string, produttore: string, varietaId: string, campo: string): SiglaLotto => {
  const now = new Date().toISOString();
  return {
    id: 'DRAFT',
    code,
    produttore,
    varietaId,
    campo,
    createdAt: now,
    updatedAt: now
  };
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
    articoloCode: '',
    articoloEan: '',
    siglaLottoId: '',
    siglaLottoCode: '',
    produttoreLotto: '',
    campoLotto: '',
    prodottoId: '',
    prodottoCode: '',
    varietaId: '',
    varietaCode: '',
    dataIngresso: formatDateInput(today),
    doyIngresso: computeDoy(today) as number | undefined,
    imballoId: '',
    imballoCode: '',
    pesoColloStandard: 0,
    categoria: '',
    calibro: '',
    note: '',
    noteSticker: ''
  });

  const compatibilityService = useMemo(() => new ArticoloLottoCompatibilityService(), []);

  useEffect(() => {
    if (!activeSessioneProduzione) return;
    const firstLineaArea = state.linee.find((l) => l.areaId === activeSessioneProduzione.areaId && l.attiva !== false)?.id || state.linee[0]?.id || '';
    setNewSessionData((prev) => ({ ...prev, areaId: activeSessioneProduzione.areaId, lineaId: firstLineaArea || prev.lineaId }));
  }, [activeSessioneProduzione, state.linee]);

  const selectedLottoById = state.sigleLotto.find((lotto) => lotto.id === newSessionData.siglaLottoId);
  const selectedVarieta = state.varieta.find((item) => item.id === newSessionData.varietaId) || null;
  const selectedProdotto = state.prodottiGrezzi.find((prodotto) => prodotto.id === newSessionData.prodottoId) || null;
  const selectedArticoloForm = state.articoli.find((articolo) => articolo.id === newSessionData.articoloId);

  const effectiveLotto = useMemo(() => {
    if (selectedLottoById && selectedVarieta) return selectedLottoById;
    if (!selectedVarieta || !newSessionData.siglaLottoCode) return undefined;
    return buildDraftLotto(newSessionData.siglaLottoCode, newSessionData.produttoreLotto, selectedVarieta.id, newSessionData.campoLotto);
  }, [selectedLottoById, selectedVarieta, newSessionData.siglaLottoCode, newSessionData.produttoreLotto, newSessionData.campoLotto]);

  const filteredArticoli = useMemo(
    () => state.articoli.filter((art) => compatibilityService.isCompatible(art, effectiveLotto, selectedVarieta || undefined)),
    [state.articoli, effectiveLotto, selectedVarieta, compatibilityService]
  );

  const lottoOptions = useMemo(() => state.sigleLotto.map((s) => ({ ...s, codice: s.code, nome: `${s.produttore} (${s.campo})` })), [state.sigleLotto]);
  const imballiOptions = useMemo(
    () => state.imballi.filter((imballo) => imballo.attivo !== false).map((imballo) => ({ ...imballo, codice: imballo.codice, nome: imballo.nome })),
    [state.imballi]
  );
  const prodottoOptions = useMemo(
    () => state.prodottiGrezzi.filter((prodotto) => prodotto.attivo !== false).map((prodotto) => ({ id: prodotto.id, codice: prodotto.codice, nome: prodotto.nome })),
    [state.prodottiGrezzi]
  );
  const varietaOptions = useMemo(
    () =>
      state.varieta
        .filter((varieta) => varieta.attiva !== false && (!newSessionData.prodottoId || varieta.prodottoId === newSessionData.prodottoId))
        .map((varieta) => ({ id: varieta.id, codice: varieta.codice, nome: varieta.nome })),
    [state.varieta, newSessionData.prodottoId]
  );

  const calibroOptions = useMemo(
    () => state.calibri.filter((calibro) => calibro.attivo && calibro.prodottoId === newSessionData.prodottoId).map((calibro) => calibro.nome),
    [state.calibri, newSessionData.prodottoId]
  );

  const compatibleLottoOptions = useMemo(() => {
    if (!sessionToSwitchLotto) return [];
    const currentArt = state.articoli.find((a) => a.id === sessionToSwitchLotto.articoloId);
    if (!currentArt) return lottoOptions;
    return compatibilityService.getCompatibleLotti(currentArt, lottoOptions, state.varieta);
  }, [sessionToSwitchLotto, lottoOptions, state.articoli, state.varieta, compatibilityService]);

  const handleSelectArticolo = (id: string) => {
    const articolo = state.articoli.find((item) => item.id === id);
    setNewSessionData((prev) => ({
      ...prev,
      articoloId: id,
      articoloCode: articolo?.codice || prev.articoloCode,
      articoloEan: articolo?.ean || prev.articoloEan,
      pesoColloStandard: articolo?.pesoColloTeorico ?? prev.pesoColloStandard,
      categoria: articolo?.categoria || prev.categoria
    }));
  };

  const handleArticoloCodeCommit = () => {
    const code = newSessionData.articoloCode.trim().toUpperCase();
    if (!code) return;
    const articolo = filteredArticoli.find((item) => item.codice.toUpperCase() === code);
    if (articolo) handleSelectArticolo(articolo.id);
  };

  const handleArticoloEanCommit = () => {
    const ean = newSessionData.articoloEan.trim();
    if (!ean) return;
    const articolo = filteredArticoli.find((item) => (item.ean || '').trim() === ean);
    if (articolo) handleSelectArticolo(articolo.id);
  };

  const handleImballoCodeCommit = () => {
    const code = newSessionData.imballoCode.trim().toUpperCase();
    if (!code) return;
    const imballo = state.imballi.find((item) => item.codice.toUpperCase() === code && item.attivo !== false);
    if (!imballo) return;
    setNewSessionData((prev) => ({ ...prev, imballoId: imballo.id, imballoCode: imballo.codice }));
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

  const handleSiglaLottoCodeChange = (code: string) => {
    setNewSessionData((prev) => ({ ...prev, siglaLottoCode: code.trim() }));
  };

  const handleSiglaLottoCodeCommit = () => {
    const normalizedCode = newSessionData.siglaLottoCode.trim();
    if (!normalizedCode) {
      setNewSessionData((prev) => ({
        ...prev,
        siglaLottoId: '',
        produttoreLotto: '',
        campoLotto: '',
        prodottoId: '',
        prodottoCode: '',
        varietaId: '',
        varietaCode: '',
        articoloId: ''
      }));
      return;
    }

    const existing = state.sigleLotto.find((lotto) => lotto.code === normalizedCode);
    if (!existing) {
      setNewSessionData((prev) => ({
        ...prev,
        siglaLottoId: '',
        produttoreLotto: '',
        campoLotto: '',
        prodottoId: '',
        prodottoCode: '',
        varietaId: '',
        varietaCode: '',
        articoloId: '',
        articoloCode: '',
        articoloEan: '',
        calibro: ''
      }));
      return;
    }

    const varieta = state.varieta.find((item) => item.id === existing.varietaId);
    const prodotto = varieta ? state.prodottiGrezzi.find((item) => item.id === varieta.prodottoId) : undefined;

    setNewSessionData((prev) => ({
      ...prev,
      siglaLottoId: existing.id,
      siglaLottoCode: existing.code,
      produttoreLotto: existing.produttore,
      campoLotto: existing.campo,
      varietaId: existing.varietaId,
      varietaCode: varieta?.codice || prev.varietaCode,
      prodottoId: varieta?.prodottoId || prev.prodottoId,
      prodottoCode: prodotto?.codice || prev.prodottoCode,
      articoloId: '',
      articoloCode: '',
      articoloEan: ''
    }));
  };

  const handleProdottoChange = (prodottoId: string) => {
    const prodotto = state.prodottiGrezzi.find((item) => item.id === prodottoId);
    setNewSessionData((prev) => ({
      ...prev,
      prodottoId,
      prodottoCode: prodotto?.codice || '',
      varietaId: state.varieta.some((varieta) => varieta.id === prev.varietaId && varieta.prodottoId === prodottoId) ? prev.varietaId : '',
      varietaCode: state.varieta.some((varieta) => varieta.id === prev.varietaId && varieta.prodottoId === prodottoId)
        ? prev.varietaCode
        : '',
      articoloId: '',
      articoloCode: '',
      articoloEan: '',
      calibro: ''
    }));
  };

  const handleProdottoCodeCommit = () => {
    const code = newSessionData.prodottoCode.trim().toUpperCase();
    if (!code) return;
    const prodotto = state.prodottiGrezzi.find((item) => item.codice.toUpperCase() === code && item.attivo !== false);
    if (prodotto) handleProdottoChange(prodotto.id);
  };

  const handleVarietaChange = (varietaId: string) => {
    const varieta = state.varieta.find((item) => item.id === varietaId);
    const prodotto = varieta ? state.prodottiGrezzi.find((item) => item.id === varieta.prodottoId) : undefined;
    setNewSessionData((prev) => ({
      ...prev,
      varietaId,
      varietaCode: varieta?.codice || '',
      prodottoId: varieta?.prodottoId || prev.prodottoId,
      prodottoCode: prodotto?.codice || prev.prodottoCode,
      articoloId: '',
      articoloCode: '',
      articoloEan: ''
    }));
  };

  const handleVarietaCodeCommit = () => {
    const code = newSessionData.varietaCode.trim().toUpperCase();
    if (!code) return;
    const varieta = state.varieta.find(
      (item) => item.codice.toUpperCase() === code && item.attiva !== false && (!newSessionData.prodottoId || item.prodottoId === newSessionData.prodottoId)
    );
    if (varieta) handleVarietaChange(varieta.id);
  };

  const isExistingLotto = Boolean(newSessionData.siglaLottoId);

  return {
    isNewSessionMode,
    setIsNewSessionMode,
    newSessionData,
    setNewSessionData,
    lottoOptions,
    filteredArticoli,
    compatibleLottoOptions,
    selectedVarieta,
    selectedProdotto,
    selectedArticoloForm,
    imballiOptions,
    prodottoOptions,
    varietaOptions,
    calibroOptions,
    isExistingLotto,
    handleSelectArticolo,
    handleArticoloCodeCommit,
    handleArticoloEanCommit,
    handleImballoCodeCommit,
    handleDataIngressoChange,
    handleDoyIngressoChange,
    handleSiglaLottoCodeChange,
    handleSiglaLottoCodeCommit,
    handleProdottoChange,
    handleProdottoCodeCommit,
    handleVarietaChange,
    handleVarietaCodeCommit
  };
};
