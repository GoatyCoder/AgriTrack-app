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

const getSafeDoy = (dataIngresso?: string): number | undefined => {
  if (!dataIngresso) return undefined;
  const parsedDate = new Date(dataIngresso);
  if (Number.isNaN(parsedDate.getTime())) return undefined;
  return computeDoy(parsedDate);
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
  tipologieScarto: INITIAL_TIPOLOGIE_SCARTO
});

export const normalizeLegacyState = (raw: any): AppState => {
  const aree = applyAuditDefaults(raw.aree || INITIAL_AREE);
  const linee = applyAuditDefaults(raw.linee || INITIAL_LINEE);
  const defaultAreaId = aree[0]?.id || INITIAL_AREE[0].id;
  const tipologie = applyAuditDefaults(raw.tipologie || INITIAL_TIPOLOGIE);

  return {
    ...buildInitialState(),
    ...raw,
    schemaVersion: SCHEMA_VERSION,
    aree,
    linee,
    tipologieScarto: applyAuditDefaults(raw.tipologieScarto || INITIAL_TIPOLOGIE_SCARTO),
    tipologie,
    calibri: applyAuditDefaults(raw.calibri || INITIAL_CALIBRI),
    sessioniProduzione: (raw.sessioniProduzione || []).map((sessione: any) => ({
      ...sessione,
      areaId: sessione.areaId || defaultAreaId
    })),
    lavorazioni: (raw.lavorazioni || []).map((lavorazione: any) => ({
      ...lavorazione,
      sessioneProduzioneId: lavorazione.sessioneProduzioneId || lavorazione.turnoId,
      lineaId: lavorazione.lineaId || LEGACY_LINEA_TO_LINEA_ID[lavorazione.linea] || linee[0]?.id || INITIAL_LINEE[0].id,
      doyIngresso: lavorazione.doyIngresso ?? getSafeDoy(lavorazione.dataIngresso)
    })),
    varieta: applyAuditDefaults((raw.varieta || INITIAL_VARIETA).map((varieta: any) => ({
      ...varieta,
      tipologiaId: varieta.tipologiaId
    }))),
    articoli: applyAuditDefaults((raw.articoli || INITIAL_ARTICOLI).map((articolo: any) => ({
      ...articolo,
      tipologiaId: articolo.tipologiaId
    }))),
    sigleLotto: applyAuditDefaults(raw.sigleLotto || INITIAL_SIGLE_LOTTO),
    imballi: applyAuditDefaults(raw.imballi || INITIAL_IMBALLI),
    prodottiGrezzi: applyAuditDefaults(raw.prodottiGrezzi || INITIAL_PRODOTTI),
    pedane: (raw.pedane || []).map((pedana: any, idx: number) => ({
      ...pedana,
      doy: pedana.doy ?? (parseInt((pedana.stickerCode || '').split('-')[1], 10) || 0),
      seq: pedana.seq ?? (parseInt((pedana.stickerCode || '').split('-')[2], 10) || idx + 1),
      imballoId: pedana.imballoId || undefined,
      calibroId: pedana.calibroId || undefined,
      snapshotImballo: pedana.snapshotImballo,
      snapshotCalibro: pedana.snapshotCalibro
    })),
    scarti: (raw.scarti || []).map((scarto: any) => ({
      ...scarto,
      sessioneProduzioneId: scarto.sessioneProduzioneId
    }))
  };
};
