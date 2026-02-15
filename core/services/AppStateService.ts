import { AppState } from '../../types';
import { INITIAL_AREE, INITIAL_ARTICOLI, INITIAL_CALIBRI, INITIAL_IMBALLI, INITIAL_LINEE, INITIAL_PRODOTTI, INITIAL_SIGLE_LOTTO, INITIAL_TIPOLOGIE, INITIAL_TIPOLOGIE_SCARTO, INITIAL_VARIETA } from '../../constants';

export const SCHEMA_VERSION = '0.2.0';

const LEGACY_LINEA_TO_LINEA_ID: Record<string, string> = {
  'Linea 1': 'L1',
  'Linea 2': 'L2',
  'Linea 3 (Manuale)': 'L3',
  'Calibratrice A': 'L4'
};

export const buildInitialState = (): AppState => ({
  schemaVersion: SCHEMA_VERSION,
  turni: [],
  sessioni: [],
  pedane: [],
  scarti: [],
  aree: INITIAL_AREE,
  linee: INITIAL_LINEE,
  prodotti: INITIAL_PRODOTTI,
  tipologie: INITIAL_TIPOLOGIE,
  calibri: INITIAL_CALIBRI,
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

  const base = buildInitialState();
  const versioned = {
    ...base,
    ...raw,
    schemaVersion: raw.schemaVersion || SCHEMA_VERSION,
    aree,
    linee,
    tipologieScarto: raw.tipologieScarto || INITIAL_TIPOLOGIE_SCARTO,
    tipologie: raw.tipologie || INITIAL_TIPOLOGIE,
    calibri: raw.calibri || INITIAL_CALIBRI,
    turni: (raw.turni || []).map((t: any) => ({ ...t, areaId: t.areaId || defaultAreaId })),
    sessioni: (raw.sessioni || []).map((s: any) => ({
      ...s,
      lineaId: s.lineaId || LEGACY_LINEA_TO_LINEA_ID[s.linea] || linee[0]?.id || INITIAL_LINEE[0].id
    })),
    varieta: (raw.varieta || INITIAL_VARIETA).map((v: any) => ({
      ...v,
      tipologiaId: v.tipologiaId || (raw.tipologie || INITIAL_TIPOLOGIE).find((t: any) => t.nome === v.categoria && t.prodottoId === v.prodottoId)?.id
    })),
    articoli: (raw.articoli || INITIAL_ARTICOLI).map((a: any) => ({
      ...a,
      tipologiaId: a.tipologiaId || (raw.tipologie || INITIAL_TIPOLOGIE).find((t: any) => t.nome === a.categoria && t.prodottoId === a.prodottoId)?.id
    })),
    pedane: (raw.pedane || []).map((p: any, idx: number) => ({
      ...p,
      doy: p.doy ?? (parseInt((p.stickerCode || '').split('-')[1]) || 0),
      seq: p.seq ?? (parseInt((p.stickerCode || '').split('-')[2]) || idx + 1),
      imballoId: p.imballoId || undefined,
      calibroId: p.calibroId || undefined,
      snapshotImballo: p.snapshotImballo || (p.imballo ? { codice: '', nome: p.imballo } : undefined),
      snapshotCalibro: p.snapshotCalibro || (p.calibro ? { nome: p.calibro } : undefined)
    }))
  };

  return { ...versioned, schemaVersion: SCHEMA_VERSION };
};
