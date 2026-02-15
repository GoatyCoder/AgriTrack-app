import { AppState } from '../../types';
import { INITIAL_AREE, INITIAL_ARTICOLI, INITIAL_CALIBRI, INITIAL_IMBALLI, INITIAL_LINEE, INITIAL_PRODOTTI, INITIAL_SIGLE_LOTTO, INITIAL_TIPOLOGIE, INITIAL_TIPOLOGIE_SCARTO, INITIAL_VARIETA } from '../../constants';
import { computeDoy } from '../../utils';

export const SCHEMA_VERSION = '0.2.0';

const LEGACY_LINEA_TO_LINEA_ID: Record<string, string> = {
  'Linea 1': 'L1',
  'Linea 2': 'L2',
  'Linea 3 (Manuale)': 'L3',
  'Calibratrice A': 'L4'
};

const applyAuditDefaults = <T extends Record<string, any>>(rows: T[]): T[] => {
  const now = new Date().toISOString();
  return rows.map((row) => ({
    ...row,
    createdAt: row.createdAt || now,
    updatedAt: row.updatedAt || now
  }));
};

export const buildInitialState = (): AppState => ({
  schemaVersion: SCHEMA_VERSION,
  sessioniProduzione: [],
  lavorazioni: [],
  pedane: [],
  scarti: [],
  aree: INITIAL_AREE,
  linee: INITIAL_LINEE,
  prodottiGrezzi: INITIAL_PRODOTTI,
  tipologie: INITIAL_TIPOLOGIE,
  calibri: INITIAL_CALIBRI,
  varieta: INITIAL_VARIETA,
  articoli: INITIAL_ARTICOLI,
  sigleLotto: INITIAL_SIGLE_LOTTO,
  imballi: INITIAL_IMBALLI,
  tipologieScarto: INITIAL_TIPOLOGIE_SCARTO,
  turni: [],
  sessioni: [],
  prodotti: INITIAL_PRODOTTI
});

export const normalizeLegacyState = (raw: any): AppState => {
  const aree = applyAuditDefaults(raw.aree || INITIAL_AREE);
  const linee = applyAuditDefaults(raw.linee || INITIAL_LINEE);
  const defaultAreaId = aree[0]?.id || INITIAL_AREE[0].id;

  const tipologie = applyAuditDefaults(raw.tipologie || INITIAL_TIPOLOGIE);
  const calibri = applyAuditDefaults(raw.calibri || INITIAL_CALIBRI);

  const sessioniProduzione = (raw.sessioniProduzione || raw.turni || []).map((sessione: any) => ({
    ...sessione,
    areaId: sessione.areaId || defaultAreaId
  }));

  const lavorazioni = (raw.lavorazioni || raw.sessioni || []).map((lavorazione: any) => ({
    ...lavorazione,
    sessioneProduzioneId: lavorazione.sessioneProduzioneId || lavorazione.turnoId,
    turnoId: lavorazione.turnoId || lavorazione.sessioneProduzioneId,
    lineaId: lavorazione.lineaId || LEGACY_LINEA_TO_LINEA_ID[lavorazione.linea] || linee[0]?.id || INITIAL_LINEE[0].id,
    doyIngresso: lavorazione.doyIngresso || computeDoy(new Date(lavorazione.dataIngresso))
  }));

  const prodottiGrezzi = applyAuditDefaults(raw.prodottiGrezzi || raw.prodotti || INITIAL_PRODOTTI);

  const base = buildInitialState();
  const versioned: AppState = {
    ...base,
    ...raw,
    schemaVersion: raw.schemaVersion || SCHEMA_VERSION,
    aree,
    linee,
    tipologieScarto: applyAuditDefaults(raw.tipologieScarto || INITIAL_TIPOLOGIE_SCARTO),
    tipologie,
    calibri,
    sessioniProduzione,
    lavorazioni,
    varieta: applyAuditDefaults((raw.varieta || INITIAL_VARIETA).map((v: any) => ({
      ...v,
      tipologiaId: v.tipologiaId || tipologie.find((t: any) => t.nome === v.categoria && t.prodottoId === v.prodottoId)?.id
    }))),
    articoli: applyAuditDefaults((raw.articoli || INITIAL_ARTICOLI).map((a: any) => ({
      ...a,
      tipologiaId: a.tipologiaId || tipologie.find((t: any) => t.nome === a.categoria && t.prodottoId === a.prodottoId)?.id
    }))),
    sigleLotto: applyAuditDefaults(raw.sigleLotto || INITIAL_SIGLE_LOTTO),
    imballi: applyAuditDefaults(raw.imballi || INITIAL_IMBALLI),
    prodottiGrezzi,
    pedane: (raw.pedane || []).map((p: any, idx: number) => ({
      ...p,
      doy: p.doy ?? (parseInt((p.stickerCode || '').split('-')[1]) || 0),
      seq: p.seq ?? (parseInt((p.stickerCode || '').split('-')[2]) || idx + 1),
      imballoId: p.imballoId || undefined,
      calibroId: p.calibroId || undefined,
      snapshotImballo: p.snapshotImballo || (p.imballo ? { codice: '', nome: p.imballo } : undefined),
      snapshotCalibro: p.snapshotCalibro || (p.calibro ? { nome: p.calibro } : undefined)
    })),
    scarti: (raw.scarti || []).map((s: any) => ({
      ...s,
      sessioneProduzioneId: s.sessioneProduzioneId || s.turnoId,
      turnoId: s.turnoId || s.sessioneProduzioneId
    })),
    // legacy compatibility mirrors
    turni: sessioniProduzione,
    sessioni: lavorazioni,
    prodotti: prodottiGrezzi
  };

  return { ...versioned, schemaVersion: SCHEMA_VERSION };
};
