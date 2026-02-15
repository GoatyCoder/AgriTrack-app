import { z } from 'zod';

const AuditFieldsSchema = z.object({
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  createdBy: z.string().optional(),
  updatedBy: z.string().optional()
});

const PausaEventoSchema = z.object({
  inizio: z.string(),
  fine: z.string().optional(),
  motivo: z.string().optional()
});

const SessioneProduzioneSchema = z.object({
  id: z.string(),
  inizio: z.string(),
  fine: z.string().optional(),
  operatore: z.string(),
  areaId: z.string(),
  status: z.enum(['APERTO', 'PAUSA', 'CHIUSO']),
  pause: z.array(PausaEventoSchema)
});

const LavorazioneSchema = z.object({
  id: z.string(),
  sessioneProduzioneId: z.string().optional(),
  lineaId: z.string(),
  siglaLottoId: z.string(),
  dataIngresso: z.string(),
  doyIngresso: z.number().optional(),
  articoloId: z.string(),
  inizio: z.string(),
  fine: z.string().optional(),
  status: z.enum(['ATTIVA', 'PAUSA', 'CHIUSA']),
  pause: z.array(PausaEventoSchema),
  warningSovrapposizione: z.boolean().optional(),
  note: z.string().optional()
});

const PedanaSchema = z.object({
  id: z.string(),
  sessioneId: z.string(),
  stickerCode: z.string(),
  doy: z.number(),
  seq: z.number(),
  numeroColli: z.number(),
  pesoTotale: z.number(),
  timestamp: z.string(),
  imballoId: z.string().optional(),
  calibroId: z.string().optional(),
  categoriaCommercialeId: z.string().optional(),
  snapshotImballo: z.object({ codice: z.string(), nome: z.string() }).optional(),
  snapshotArticolo: z.object({ id: z.string(), nome: z.string(), codice: z.string() }).optional(),
  snapshotIngresso: z.object({ siglaLottoId: z.string(), lottoCode: z.string(), dataIngresso: z.string() }).optional(),
  snapshotCalibro: z.object({ nome: z.string() }).optional(),
  snapshotCategoria: z.object({ nome: z.string() }).optional()
});

const BaseEntitySchema = z.object({
  id: z.string(),
  codice: z.string(),
  nome: z.string()
}).merge(AuditFieldsSchema);

export const AppStateSchema = z.object({
  schemaVersion: z.string().default('0.2.0'),
  sessioniProduzione: z.array(SessioneProduzioneSchema).optional(),
  lavorazioni: z.array(LavorazioneSchema).optional(),
  pedane: z.array(PedanaSchema),
  scarti: z.array(z.object({
    id: z.string(),
    sessioneProduzioneId: z.string().optional(),
      siglaLottoId: z.string(),
    dataIngresso: z.string(),
    tipologia: z.string(),
    peso: z.number(),
    timestamp: z.string(),
    sessioneId: z.string().optional()
  })),
  aree: z.array(z.object({ id: z.string(), nome: z.string(), attiva: z.boolean() }).merge(AuditFieldsSchema)),
  linee: z.array(z.object({ id: z.string(), areaId: z.string(), nome: z.string(), attiva: z.boolean() }).merge(AuditFieldsSchema)),
  prodottiGrezzi: z.array(z.object({ id: z.string(), codice: z.string(), nome: z.string(), categorie: z.array(z.string()).optional(), calibri: z.array(z.string()).optional(), attivo: z.boolean().optional() }).merge(AuditFieldsSchema)).optional(),
  tipologie: z.array(z.object({ id: z.string(), nome: z.string(), prodottoId: z.string(), ordinamento: z.number(), attivo: z.boolean() }).merge(AuditFieldsSchema)).default([]),
  calibri: z.array(z.object({ id: z.string(), nome: z.string(), prodottoId: z.string(), ordinamento: z.number(), descrizione: z.string().optional(), attivo: z.boolean() }).merge(AuditFieldsSchema)).default([]),
  varieta: z.array(z.object({ id: z.string(), prodottoId: z.string(), codice: z.string(), nome: z.string(), tipologiaId: z.string().optional(), attiva: z.boolean().optional() }).merge(AuditFieldsSchema)),
  articoli: z.array(z.object({ id: z.string(), codice: z.string(), nome: z.string(), prodottoId: z.string().optional(), varietaId: z.string().optional(), tipologiaId: z.string().optional(), pesoColloTeorico: z.number(), tipoPeso: z.enum(['EGALIZZATO', 'USCENTE']), attivo: z.boolean().optional() }).merge(AuditFieldsSchema)),
  sigleLotto: z.array(z.object({ id: z.string(), code: z.string().regex(/^\d{4,5}$/, 'Sigla lotto non valida'), produttore: z.string(), varietaId: z.string(), campo: z.string() }).merge(AuditFieldsSchema)),
  imballi: z.array(BaseEntitySchema.extend({ taraKg: z.number().optional(), attivo: z.boolean().optional() })),
  tipologieScarto: z.array(z.object({ id: z.string(), codice: z.string(), nome: z.string(), prodottoId: z.string().optional(), attiva: z.boolean() }).merge(AuditFieldsSchema))
});
