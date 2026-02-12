import { AppState } from '../../types';
import { INITIAL_AREE, INITIAL_ARTICOLI, INITIAL_IMBALLI, INITIAL_LINEE, INITIAL_PRODOTTI, INITIAL_SIGLE_LOTTO, INITIAL_TIPOLOGIE_SCARTO, INITIAL_VARIETA } from '../../constants';

const LEGACY_LINEA_TO_LINEA_ID: Record<string, string> = {
  'Linea 1': 'L1',
  'Linea 2': 'L2',
  'Linea 3 (Manuale)': 'L3',
  'Calibratrice A': 'L4'
};

export const buildInitialState = (): AppState => ({
  turni: [],
  sessioni: [],
  pedane: [],
  scarti: [],
  aree: INITIAL_AREE,
  linee: INITIAL_LINEE,
  prodotti: INITIAL_PRODOTTI,
  varieta: INITIAL_VARIETA,
  articoli: INITIAL_ARTICOLI,
  sigleLotto: INITIAL_SIGLE_LOTTO,
  imballi: INITIAL_IMBALLI,
  tipologieScarto: INITIAL_TIPOLOGIE_SCARTO
});

export const normalizeLegacyState = (raw: any): AppState => {
  const aree = raw.aree || INITIAL_AREE;
  const linee = raw.linee || INITIAL_LINEE;
  const defaultAreaId = aree[0]?.id || INITIAL_AREE[0].id;

  return {
    ...buildInitialState(),
    ...raw,
    aree,
    linee,
    tipologieScarto: raw.tipologieScarto || INITIAL_TIPOLOGIE_SCARTO,
    turni: (raw.turni || []).map((t: any) => ({ ...t, areaId: t.areaId || defaultAreaId })),
    sessioni: (raw.sessioni || []).map((s: any) => ({
      ...s,
      lineaId: s.lineaId || LEGACY_LINEA_TO_LINEA_ID[s.linea] || linee[0]?.id || INITIAL_LINEE[0].id
    })),
    pedane: (raw.pedane || []).map((p: any, idx: number) => ({
      ...p,
      doy: p.doy ?? (parseInt((p.stickerCode || '').split('-')[1]) || 0),
      seq: p.seq ?? (parseInt((p.stickerCode || '').split('-')[2]) || idx + 1),
      imballoId: p.imballoId || undefined,
      snapshotImballo: p.snapshotImballo || (p.imballo ? { codice: '', nome: p.imballo } : undefined)
    }))
  };
};
