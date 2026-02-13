import { z } from 'zod';

const PausaEventoSchema = z.object({
  inizio: z.string(),
  fine: z.string().optional(),
  motivo: z.string().optional()
});

const TurnoSchema = z.object({
  id: z.string(),
  inizio: z.string(),
  fine: z.string().optional(),
  operatore: z.string(),
  areaId: z.string(),
  status: z.enum(['APERTO', 'PAUSA', 'CHIUSO']),
  pause: z.array(PausaEventoSchema)
});

const SessioneSchema = z.object({
  id: z.string(),
  turnoId: z.string(),
  lineaId: z.string(),
  siglaLottoId: z.string(),
  dataIngresso: z.string(),
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
  calibro: z.string().optional(),
  snapshotImballo: z.object({ codice: z.string(), nome: z.string() }).optional(),
  snapshotArticolo: z.object({ id: z.string(), nome: z.string(), codice: z.string() }).optional(),
  snapshotIngresso: z.object({ siglaLottoId: z.string(), lottoCode: z.string(), dataIngresso: z.string() }).optional()
});

const BaseEntitySchema = z.object({
  id: z.string(),
  codice: z.string(),
  nome: z.string()
});

export const AppStateSchema = z.object({
  turni: z.array(TurnoSchema),
  sessioni: z.array(SessioneSchema),
  pedane: z.array(PedanaSchema),
  scarti: z.array(z.object({
    id: z.string(),
    turnoId: z.string(),
    siglaLottoId: z.string(),
    dataIngresso: z.string(),
    tipologia: z.string(),
    peso: z.number(),
    timestamp: z.string(),
    sessioneId: z.string().optional()
  })),
  aree: z.array(z.object({ id: z.string(), nome: z.string(), attiva: z.boolean() })),
  linee: z.array(z.object({ id: z.string(), areaId: z.string(), nome: z.string(), attiva: z.boolean() })),
  prodotti: z.array(z.object({ id: z.string(), codice: z.string(), nome: z.string(), categorie: z.array(z.string()), calibri: z.array(z.string()), attivo: z.boolean().optional() })),
  varieta: z.array(z.object({ id: z.string(), prodottoId: z.string(), codice: z.string(), nome: z.string(), categoria: z.string().optional(), attiva: z.boolean().optional() })),
  articoli: z.array(z.object({ id: z.string(), codice: z.string(), nome: z.string(), prodottoId: z.string().optional(), varietaId: z.string().optional(), categoria: z.string().optional(), pesoColloTeorico: z.number(), tipoPeso: z.enum(['EGALIZZATO', 'USCENTE']), attivo: z.boolean().optional() })),
  sigleLotto: z.array(z.object({ id: z.string(), code: z.string(), produttore: z.string(), varietaId: z.string(), campo: z.string() })),
  imballi: z.array(BaseEntitySchema.extend({ taraKg: z.number().optional(), attivo: z.boolean().optional() })),
  tipologieScarto: z.array(z.object({ id: z.string(), codice: z.string(), nome: z.string(), prodottoId: z.string().optional(), attiva: z.boolean() }))
});
