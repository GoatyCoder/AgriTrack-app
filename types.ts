export interface Area {
  id: string;
  nome: string;
  attiva: boolean;
}

export interface Linea {
  id: string;
  areaId: string;
  nome: string;
  attiva: boolean;
}

export interface Prodotto {
  id: string;
  codice: string;
  nome: string;
  categorie: string[];
  calibri: string[];
  attivo?: boolean;
}

export interface Tipologia {
  id: string;
  nome: string;
  prodottoId: string;
  ordinamento: number;
  attivo: boolean;
}

export interface Calibro {
  id: string;
  nome: string;
  prodottoId: string;
  ordinamento: number;
  descrizione?: string;
  attivo: boolean;
}

export interface Varieta {
  id: string;
  prodottoId: string;
  codice: string;
  nome: string;
  categoria?: string; // legacy
  tipologiaId?: string;
  attiva?: boolean;
}

export interface SiglaLotto {
  id: string;
  code: string;
  produttore: string;
  varietaId: string;
  campo: string;
}

export type TipoPesoArticolo = 'EGALIZZATO' | 'USCENTE';

export interface Articolo {
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

export interface Imballo {
  id: string;
  codice: string;
  nome: string;
  taraKg?: number;
  attivo?: boolean;
}

export interface TipologiaScarto {
  id: string;
  codice: string;
  nome: string;
  prodottoId?: string;
  attiva: boolean;
}

export interface PausaEvento {
  inizio: string;
  fine?: string;
  motivo?: string;
}

export interface Turno {
  id: string;
  inizio: string;
  fine?: string;
  operatore: string;
  areaId: string;
  status: 'APERTO' | 'PAUSA' | 'CHIUSO';
  pause: PausaEvento[];
}

export interface SessioneLinea {
  id: string;
  turnoId: string;
  lineaId: string;
  siglaLottoId: string;
  dataIngresso: string;
  articoloId: string;
  inizio: string;
  fine?: string;
  status: 'ATTIVA' | 'PAUSA' | 'CHIUSA';
  pause: PausaEvento[];
  warningSovrapposizione?: boolean;
  note?: string;
}

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
  turnoId: string;
  siglaLottoId: string;
  dataIngresso: string;
  tipologia: string;
  peso: number;
  timestamp: string;
  sessioneId?: string;
}

export interface AppState {
  schemaVersion: string;
  turni: Turno[];
  sessioni: SessioneLinea[];
  pedane: Pedana[];
  scarti: Scarto[];
  aree: Area[];
  linee: Linea[];
  prodotti: Prodotto[];
  tipologie: Tipologia[];
  calibri: Calibro[];
  varieta: Varieta[];
  articoli: Articolo[];
  sigleLotto: SiglaLotto[];
  imballi: Imballo[];
  tipologieScarto: TipologiaScarto[];
}
