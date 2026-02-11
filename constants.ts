
import { Articolo, SiglaLotto, Prodotto, Varieta, Imballo } from './types';

export const INITIAL_PRODOTTI: Prodotto[] = [
  { 
    id: 'P1', 
    codice: 'UVA',
    nome: 'Uva da Tavola', 
    categorie: ['Bianca Con Semi', 'Bianca Senza Semi', 'Rossa Con Semi', 'Rossa Senza Semi', 'Nera Senza Semi'],
    calibri: ['S', 'M', 'L', 'XL', 'XXL', 'Misto']
  },
  { 
    id: 'P2', 
    codice: 'AGR',
    nome: 'Agrumi (Mandarini)', 
    categorie: ['Clementine', 'Tardivo', 'Ibrido'],
    calibri: ['1XX', '1X', '1', '2', '3', '4', '5']
  },
  { 
    id: 'P3', 
    codice: 'ALB',
    nome: 'Albicocche', 
    categorie: ['Precoce', 'Tardiva', 'Rossa'],
    calibri: ['AAAA', 'AAA', 'AA', 'A', 'B', 'C']
  }
];

export const INITIAL_VARIETA: Varieta[] = [
  // Uva
  { id: 'V1', prodottoId: 'P1', codice: 'ITA', nome: 'Italia', categoria: 'Bianca Con Semi' },
  { id: 'V2', prodottoId: 'P1', codice: 'VIT', nome: 'Vittoria', categoria: 'Bianca Con Semi' },
  { id: 'V3', prodottoId: 'P1', codice: 'RED', nome: 'Red Globe', categoria: 'Rossa Con Semi' },
  { id: 'V4', prodottoId: 'P1', codice: 'CRI', nome: 'Crimson', categoria: 'Rossa Senza Semi' },
  { id: 'V5', prodottoId: 'P1', codice: 'AUT', nome: 'Autumn Crisp', categoria: 'Bianca Senza Semi' },
  { id: 'V6', prodottoId: 'P1', codice: 'SWT', nome: 'Sweet Celebration', categoria: 'Rossa Senza Semi' },
  // Agrumi
  { id: 'V7', prodottoId: 'P2', codice: 'NAD', nome: 'Nadorcott', categoria: 'Tardivo' },
  { id: 'V8', prodottoId: 'P2', codice: 'TAR', nome: 'Tarocco', categoria: 'Ibrido' },
  { id: 'V9', prodottoId: 'P2', codice: 'ORO', nome: 'Orogros', categoria: 'Clementine' }
];

export const INITIAL_ARTICOLI: Articolo[] = [
  { id: 'ART1', codice: '10x500', nome: 'Cestini 10x500g (Bianca SS)', prodottoId: 'P1', categoria: 'Bianca Senza Semi', pesoColloTeorico: 5.0, tipoPeso: 'EGALIZZATO' },
  { id: 'ART2', codice: '5KG', nome: 'Cartone 30x40 5kg (Rossa SS)', prodottoId: 'P1', categoria: 'Rossa Senza Semi', pesoColloTeorico: 5.0, tipoPeso: 'EGALIZZATO' },
  { id: 'ART3', codice: 'SFUSO', nome: 'Plateau 60x40 Sfuso (Mista)', prodottoId: 'P1', pesoColloTeorico: 7.0, tipoPeso: 'USCENTE' },
  { id: 'ART4', codice: 'FOG', nome: 'Mandarini con Foglia 2 Strati', prodottoId: 'P2', varietaId: 'V7', pesoColloTeorico: 10.0, tipoPeso: 'EGALIZZATO' },
  { id: 'ART5', codice: 'RETE', nome: 'Mandarini Defogliati Rete 1kg', prodottoId: 'P2', categoria: 'Tardivo', pesoColloTeorico: 8.0, tipoPeso: 'EGALIZZATO' },
];

export const INITIAL_SIGLE_LOTTO: SiglaLotto[] = [
  { id: 'SL1', code: 'ROSSI-VIT-F01', produttore: 'Az. Rossi', varietaId: 'V2', campo: 'Fondo Valle' },
  { id: 'SL2', code: 'BIANCHI-CRI-F02', produttore: 'Az. Bianchi', varietaId: 'V4', campo: 'Poggio Alto' },
  { id: 'SL3', code: 'VERDI-NAD-F05', produttore: 'Az. Verdi', varietaId: 'V7', campo: 'Contrada X' },
];

export const INITIAL_IMBALLI: Imballo[] = [
  { id: 'IMB1', codice: '3040', nome: 'Cartone 30x40' },
  { id: 'IMB2', codice: '4060', nome: 'Cartone 40x60' },
  { id: 'IMB3', codice: 'CPR', nome: 'CPR 6416' },
  { id: 'IMB4', codice: 'IFCO', nome: 'IFCO Green' },
  { id: 'IMB5', codice: 'LEGNO', nome: 'Padellina Legno' },
];

export const TIPI_SCARTO = [
  'Marcio',
  'Sotto Calibro',
  'Difetto Estetico',
  'Danni Meccanici',
  'Troppo Giallo',
  'Verde/Immaturo',
  'Acini Rotti'
];

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
