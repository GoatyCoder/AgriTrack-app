export interface AuditFields {
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface Area extends AuditFields {
  id: string;
  nome: string;
  attiva: boolean;
}

export interface Linea extends AuditFields {
  id: string;
  areaId: string;
  nome: string;
  attiva: boolean;
}

export interface ProdottoGrezzo extends AuditFields {
  id: string;
  codice: string;
  nome: string;
  categorie: string[]; // legacy compatibility
  calibri: string[]; // legacy compatibility
  attivo?: boolean;
}

export type Prodotto = ProdottoGrezzo;

export interface Tipologia extends AuditFields {
  id: string;
  nome: string;
  prodottoId: string;
  ordinamento: number;
  attivo: boolean;
}

export interface Calibro extends AuditFields {
  id: string;
  nome: string;
  prodottoId: string;
  ordinamento: number;
  descrizione?: string;
  attivo: boolean;
}

export interface Varieta extends AuditFields {
  id: string;
  prodottoId: string;
  codice: string;
  nome: string;
  categoria?: string; // legacy
  tipologiaId?: string;
  attiva?: boolean;
}

export interface SiglaLotto extends AuditFields {
  id: string;
  code: string;
  produttore: string;
  varietaId: string;
  campo: string;
}

export type TipoPesoArticolo = 'EGALIZZATO' | 'USCENTE';

export interface Articolo extends AuditFields {
  id: string;
  codice: string;
  nome: string;
  prodottoId?: string;
  varietaId?: string;
  categoria?: string; // legacy
  tipologiaId?: string;
  pesoColloTeorico: number;
  tipoPeso: TipoPesoArticolo;
  attivo?: boolean;
}

export interface Imballo extends AuditFields {
  id: string;
  codice: string;
  nome: string;
  taraKg?: number;
  attivo?: boolean;
}

export interface TipologiaScarto extends AuditFields {
  id: string;
  codice: string;
  nome: string;
  prodottoId?: string;
  attiva: boolean;
}

export interface CategoriaCommerciale extends AuditFields {
  id: string;
  nome: string;
  ordinamento: number;
  descrizione?: string;
  attiva: boolean;
}

export interface PausaEvento {
  inizio: string;
  fine?: string;
  motivo?: string;
}

export interface SessioneProduzione {
  id: string;
  inizio: string;
  fine?: string;
  operatore: string;
  areaId: string;
  status: 'APERTO' | 'PAUSA' | 'CHIUSO';
  pause: PausaEvento[];
}

export type Turno = SessioneProduzione;

export interface Lavorazione {
  id: string;
  sessioneProduzioneId?: string;
  turnoId?: string; // legacy
  lineaId: string;
  siglaLottoId: string;
  dataIngresso: string;
  doyIngresso?: number;
  articoloId: string;
  inizio: string;
  fine?: string;
  status: 'ATTIVA' | 'PAUSA' | 'CHIUSA';
  pause: PausaEvento[];
  warningSovrapposizione?: boolean;
  note?: string;
}

export type SessioneLinea = Lavorazione;

export interface Pedana {
  id: string;
  sessioneId: string;
  stickerCode: string;
  doy: number;
  seq: number;
  numeroColli: number;
  pesoTotale: number;
  timestamp: string;
  imballoId?: string;
  calibro?: string; // legacy
  calibroId?: string;
  categoriaCommercialeId?: string;
  snapshotImballo?: { codice: string; nome: string };
  snapshotArticolo?: { id: string; nome: string; codice: string };
  snapshotIngresso?: { siglaLottoId: string; lottoCode: string; dataIngresso: string };
  snapshotCalibro?: { nome: string };
  snapshotCategoria?: { nome: string };
}

export interface Scarto {
  id: string;
  sessioneProduzioneId?: string;
  turnoId?: string; // legacy
  siglaLottoId: string;
  dataIngresso: string;
  tipologia: string;
  peso: number;
  timestamp: string;
  sessioneId?: string;
}

export interface AppState {
  schemaVersion: string;
  sessioniProduzione: SessioneProduzione[];
  lavorazioni: Lavorazione[];
  turni: Turno[]; // legacy mirror
  sessioni: SessioneLinea[]; // legacy mirror
  pedane: Pedana[];
  scarti: Scarto[];
  aree: Area[];
  linee: Linea[];
  prodottiGrezzi: ProdottoGrezzo[];
  prodotti: Prodotto[]; // legacy mirror
  tipologie: Tipologia[];
  calibri: Calibro[];
  varieta: Varieta[];
  articoli: Articolo[];
  sigleLotto: SiglaLotto[];
  imballi: Imballo[];
  tipologieScarto: TipologiaScarto[];
  categorieCommerciali?: CategoriaCommerciale[];
}
