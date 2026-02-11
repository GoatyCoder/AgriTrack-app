
export enum LineaName {
  L1 = 'Linea 1',
  L2 = 'Linea 2',
  L3 = 'Linea 3 (Manuale)',
  CAL_A = 'Calibratrice A'
}

export interface Prodotto {
  id: string;
  codice: string; 
  nome: string; 
  categorie: string[]; 
  calibri: string[]; 
}

export interface Varieta {
  id: string;
  prodottoId: string;
  codice: string; 
  nome: string; 
  categoria?: string; 
}

export interface SiglaLotto {
  id: string;
  code: string; 
  produttore: string;
  varietaId: string; 
  campo: string;
}

export interface Articolo {
  id: string;
  codice: string; 
  nome: string; 
  prodottoId?: string; 
  varietaId?: string; 
  categoria?: string; 
  pesoColloTeorico: number;
  tipoPeso: 'EGALIZZATO' | 'USCENTE';
}

export interface Imballo {
  id: string;
  codice: string; 
  nome: string; 
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
  status: 'APERTO' | 'PAUSA' | 'CHIUSO';
  pause: PausaEvento[];
}

export interface SessioneLinea {
  id: string;
  turnoId: string;
  linea: LineaName;
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
  numeroColli: number;
  pesoTotale: number;
  timestamp: string;
  imballo?: string; 
  calibro?: string;
  snapshotArticolo?: { id: string; nome: string; codice: string };
  snapshotLotto?: { id: string; code: string; };
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
  turni: Turno[];
  sessioni: SessioneLinea[];
  pedane: Pedana[];
  scarti: Scarto[];
  prodotti: Prodotto[];
  varieta: Varieta[];
  articoli: Articolo[];
  sigleLotto: SiglaLotto[];
  imballi: Imballo[];
}
