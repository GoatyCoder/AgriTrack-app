import { Articolo, SiglaLotto, Prodotto, Varieta, Imballo, Area, Linea, TipologiaScarto } from './types';

export const INITIAL_AREE: Area[] = [
  { id: 'AR1', nome: 'Confezionamento', attiva: true },
  { id: 'AR2', nome: 'Calibratrice', attiva: true }
];

export const INITIAL_LINEE: Linea[] = [
  { id: 'L1', areaId: 'AR1', nome: 'Linea 1', attiva: true },
  { id: 'L2', areaId: 'AR1', nome: 'Linea 2', attiva: true },
  { id: 'L3', areaId: 'AR1', nome: 'Linea 3 (Manuale)', attiva: true },
  { id: 'L4', areaId: 'AR2', nome: 'Calibratrice A', attiva: true }
];

export const INITIAL_PRODOTTI: Prodotto[] = [
  {
    id: 'P1',
    codice: 'UVA',
    nome: 'Uva da Tavola',
    categorie: ['Bianca Con Semi', 'Bianca Senza Semi', 'Rossa Con Semi', 'Rossa Senza Semi', 'Nera Senza Semi'],
    calibri: ['S', 'M', 'L', 'XL', 'XXL', 'Misto'],
    attivo: true
  },
  {
    id: 'P2',
    codice: 'AGR',
    nome: 'Agrumi (Mandarini)',
    categorie: ['Clementine', 'Tardivo', 'Ibrido'],
    calibri: ['1XX', '1X', '1', '2', '3', '4', '5'],
    attivo: true
  },
  {
    id: 'P3',
    codice: 'ALB',
    nome: 'Albicocche',
    categorie: ['Precoce', 'Tardiva', 'Rossa'],
    calibri: ['AAAA', 'AAA', 'AA', 'A', 'B', 'C'],
    attivo: true
  }
];

export const INITIAL_VARIETA: Varieta[] = [
  { id: 'V1', prodottoId: 'P1', codice: 'ITA', nome: 'Italia', categoria: 'Bianca Con Semi', attiva: true },
  { id: 'V2', prodottoId: 'P1', codice: 'VIT', nome: 'Vittoria', categoria: 'Bianca Con Semi', attiva: true },
  { id: 'V3', prodottoId: 'P1', codice: 'RED', nome: 'Red Globe', categoria: 'Rossa Con Semi', attiva: true },
  { id: 'V4', prodottoId: 'P1', codice: 'CRI', nome: 'Crimson', categoria: 'Rossa Senza Semi', attiva: true },
  { id: 'V5', prodottoId: 'P1', codice: 'AUT', nome: 'Autumn Crisp', categoria: 'Bianca Senza Semi', attiva: true },
  { id: 'V6', prodottoId: 'P1', codice: 'SWT', nome: 'Sweet Celebration', categoria: 'Rossa Senza Semi', attiva: true },
  { id: 'V7', prodottoId: 'P2', codice: 'NAD', nome: 'Nadorcott', categoria: 'Tardivo', attiva: true },
  { id: 'V8', prodottoId: 'P2', codice: 'TAR', nome: 'Tarocco', categoria: 'Ibrido', attiva: true },
  { id: 'V9', prodottoId: 'P2', codice: 'ORO', nome: 'Orogros', categoria: 'Clementine', attiva: true }
];

export const INITIAL_ARTICOLI: Articolo[] = [
  { id: 'ART1', codice: '10x500', nome: 'Cestini 10x500g (Bianca SS)', prodottoId: 'P1', categoria: 'Bianca Senza Semi', pesoColloTeorico: 5.0, tipoPeso: 'EGALIZZATO', attivo: true },
  { id: 'ART2', codice: '5KG', nome: 'Cartone 30x40 5kg (Rossa SS)', prodottoId: 'P1', categoria: 'Rossa Senza Semi', pesoColloTeorico: 5.0, tipoPeso: 'EGALIZZATO', attivo: true },
  { id: 'ART3', codice: 'SFUSO', nome: 'Plateau 60x40 Sfuso (Mista)', prodottoId: 'P1', pesoColloTeorico: 6.0, tipoPeso: 'USCENTE', attivo: true },
  { id: 'ART4', codice: 'FOG', nome: 'Mandarini con Foglia 2 Strati', prodottoId: 'P2', varietaId: 'V7', pesoColloTeorico: 10.0, tipoPeso: 'EGALIZZATO', attivo: true },
  { id: 'ART5', codice: 'RETE', nome: 'Mandarini Defogliati Rete 1kg', prodottoId: 'P2', categoria: 'Tardivo', pesoColloTeorico: 8.0, tipoPeso: 'EGALIZZATO', attivo: true }
];

export const INITIAL_SIGLE_LOTTO: SiglaLotto[] = [
  { id: 'SL1', code: 'ROSSI-VIT-F01', produttore: 'Az. Rossi', varietaId: 'V2', campo: 'Fondo Valle' },
  { id: 'SL2', code: 'BIANCHI-CRI-F02', produttore: 'Az. Bianchi', varietaId: 'V4', campo: 'Poggio Alto' },
  { id: 'SL3', code: 'VERDI-NAD-F05', produttore: 'Az. Verdi', varietaId: 'V7', campo: 'Contrada X' }
];

export const INITIAL_IMBALLI: Imballo[] = [
  { id: 'IMB1', codice: '3040', nome: 'Cartone 30x40', attivo: true },
  { id: 'IMB2', codice: '4060', nome: 'Cartone 40x60', attivo: true },
  { id: 'IMB3', codice: 'CPR', nome: 'CPR 6416', attivo: true },
  { id: 'IMB4', codice: 'IFCO', nome: 'IFCO Green', attivo: true },
  { id: 'IMB5', codice: 'LEGNO', nome: 'Padellina Legno', attivo: true }
];

export const INITIAL_TIPOLOGIE_SCARTO: TipologiaScarto[] = [
  { id: 'TS1', codice: 'MAR', nome: 'Marcio', attiva: true },
  { id: 'TS2', codice: 'SOC', nome: 'Sotto Calibro', attiva: true },
  { id: 'TS3', codice: 'EST', nome: 'Difetto Estetico', attiva: true },
  { id: 'TS4', codice: 'DME', nome: 'Danni Meccanici', attiva: true }
];

export const TIPI_SCARTO = INITIAL_TIPOLOGIE_SCARTO.map(s => s.nome);

export const MOTIVI_PAUSA = [
  'Pausa Personale',
  'Cambio Formato',
  'Manutenzione',
  'Mancanza Merce',
  'Guasto Tecnico',
  'Pulizia Linea',
  'Fine Lotto',
  'Altro'
];
