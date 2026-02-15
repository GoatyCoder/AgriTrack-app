import { Articolo, SiglaLotto, ProdottoGrezzo, Varieta, Imballo, Area, Linea, TipologiaScarto, Tipologia, Calibro } from './types';

const nowIso = new Date().toISOString();
const withAudit = <T extends object>(entity: T) => ({
  ...entity,
  createdAt: nowIso,
  updatedAt: nowIso
});

export const INITIAL_AREE: Area[] = [
  withAudit({ id: 'AR1', nome: 'Confezionamento', attiva: true }),
  withAudit({ id: 'AR2', nome: 'Calibratrice', attiva: true })
];

export const INITIAL_LINEE: Linea[] = [
  withAudit({ id: 'L1', areaId: 'AR1', nome: 'Linea 1', attiva: true }),
  withAudit({ id: 'L2', areaId: 'AR1', nome: 'Linea 2', attiva: true }),
  withAudit({ id: 'L3', areaId: 'AR1', nome: 'Linea 3 (Manuale)', attiva: true }),
  withAudit({ id: 'L4', areaId: 'AR2', nome: 'Calibratrice A', attiva: true })
];

export const INITIAL_PRODOTTI: ProdottoGrezzo[] = [
  withAudit({
    id: 'P1',
    codice: 'UVA',
    nome: 'Uva da Tavola',
    categorie: ['Bianca Con Semi', 'Bianca Senza Semi', 'Rossa Con Semi', 'Rossa Senza Semi', 'Nera Senza Semi'],
    calibri: ['S', 'M', 'L', 'XL', 'XXL', 'Misto'],
    attivo: true
  }),
  withAudit({
    id: 'P2',
    codice: 'AGR',
    nome: 'Agrumi (Mandarini)',
    categorie: ['Clementine', 'Tardivo', 'Ibrido'],
    calibri: ['1XX', '1X', '1', '2', '3', '4', '5'],
    attivo: true
  }),
  withAudit({
    id: 'P3',
    codice: 'ALB',
    nome: 'Albicocche',
    categorie: ['Precoce', 'Tardiva', 'Rossa'],
    calibri: ['AAAA', 'AAA', 'AA', 'A', 'B', 'C'],
    attivo: true
  })
];

export const INITIAL_TIPOLOGIE: Tipologia[] = [
  withAudit({ id: 'TIP1', nome: 'Bianca Con Semi', prodottoId: 'P1', ordinamento: 1, attivo: true }),
  withAudit({ id: 'TIP2', nome: 'Bianca Senza Semi', prodottoId: 'P1', ordinamento: 2, attivo: true }),
  withAudit({ id: 'TIP3', nome: 'Rossa Con Semi', prodottoId: 'P1', ordinamento: 3, attivo: true }),
  withAudit({ id: 'TIP4', nome: 'Rossa Senza Semi', prodottoId: 'P1', ordinamento: 4, attivo: true }),
  withAudit({ id: 'TIP5', nome: 'Nera Senza Semi', prodottoId: 'P1', ordinamento: 5, attivo: true }),
  withAudit({ id: 'TIP6', nome: 'Clementine', prodottoId: 'P2', ordinamento: 1, attivo: true }),
  withAudit({ id: 'TIP7', nome: 'Tardivo', prodottoId: 'P2', ordinamento: 2, attivo: true }),
  withAudit({ id: 'TIP8', nome: 'Ibrido', prodottoId: 'P2', ordinamento: 3, attivo: true }),
  withAudit({ id: 'TIP9', nome: 'Precoce', prodottoId: 'P3', ordinamento: 1, attivo: true }),
  withAudit({ id: 'TIP10', nome: 'Tardiva', prodottoId: 'P3', ordinamento: 2, attivo: true }),
  withAudit({ id: 'TIP11', nome: 'Rossa', prodottoId: 'P3', ordinamento: 3, attivo: true })
];

export const INITIAL_CALIBRI: Calibro[] = [
  withAudit({ id: 'CAL1', nome: 'S', prodottoId: 'P1', ordinamento: 1, attivo: true }),
  withAudit({ id: 'CAL2', nome: 'M', prodottoId: 'P1', ordinamento: 2, attivo: true }),
  withAudit({ id: 'CAL3', nome: 'L', prodottoId: 'P1', ordinamento: 3, attivo: true }),
  withAudit({ id: 'CAL4', nome: 'XL', prodottoId: 'P1', ordinamento: 4, attivo: true }),
  withAudit({ id: 'CAL5', nome: 'XXL', prodottoId: 'P1', ordinamento: 5, attivo: true }),
  withAudit({ id: 'CAL6', nome: 'Misto', prodottoId: 'P1', ordinamento: 6, attivo: true }),
  withAudit({ id: 'CAL7', nome: '1XX', prodottoId: 'P2', ordinamento: 1, attivo: true }),
  withAudit({ id: 'CAL8', nome: '1X', prodottoId: 'P2', ordinamento: 2, attivo: true }),
  withAudit({ id: 'CAL9', nome: '1', prodottoId: 'P2', ordinamento: 3, attivo: true }),
  withAudit({ id: 'CAL10', nome: '2', prodottoId: 'P2', ordinamento: 4, attivo: true }),
  withAudit({ id: 'CAL11', nome: '3', prodottoId: 'P2', ordinamento: 5, attivo: true }),
  withAudit({ id: 'CAL12', nome: '4', prodottoId: 'P2', ordinamento: 6, attivo: true }),
  withAudit({ id: 'CAL13', nome: '5', prodottoId: 'P2', ordinamento: 7, attivo: true }),
  withAudit({ id: 'CAL14', nome: 'AAAA', prodottoId: 'P3', ordinamento: 1, attivo: true }),
  withAudit({ id: 'CAL15', nome: 'AAA', prodottoId: 'P3', ordinamento: 2, attivo: true }),
  withAudit({ id: 'CAL16', nome: 'AA', prodottoId: 'P3', ordinamento: 3, attivo: true }),
  withAudit({ id: 'CAL17', nome: 'A', prodottoId: 'P3', ordinamento: 4, attivo: true }),
  withAudit({ id: 'CAL18', nome: 'B', prodottoId: 'P3', ordinamento: 5, attivo: true }),
  withAudit({ id: 'CAL19', nome: 'C', prodottoId: 'P3', ordinamento: 6, attivo: true })
];

export const INITIAL_VARIETA: Varieta[] = [
  withAudit({ id: 'V1', prodottoId: 'P1', codice: 'ITA', nome: 'Italia', categoria: 'Bianca Con Semi', tipologiaId: 'TIP1', attiva: true }),
  withAudit({ id: 'V2', prodottoId: 'P1', codice: 'VIT', nome: 'Vittoria', categoria: 'Bianca Con Semi', tipologiaId: 'TIP1', attiva: true }),
  withAudit({ id: 'V3', prodottoId: 'P1', codice: 'RED', nome: 'Red Globe', categoria: 'Rossa Con Semi', tipologiaId: 'TIP3', attiva: true }),
  withAudit({ id: 'V4', prodottoId: 'P1', codice: 'CRI', nome: 'Crimson', categoria: 'Rossa Senza Semi', tipologiaId: 'TIP4', attiva: true }),
  withAudit({ id: 'V5', prodottoId: 'P1', codice: 'AUT', nome: 'Autumn Crisp', categoria: 'Bianca Senza Semi', tipologiaId: 'TIP2', attiva: true }),
  withAudit({ id: 'V6', prodottoId: 'P1', codice: 'SWT', nome: 'Sweet Celebration', categoria: 'Rossa Senza Semi', tipologiaId: 'TIP4', attiva: true }),
  withAudit({ id: 'V7', prodottoId: 'P2', codice: 'NAD', nome: 'Nadorcott', categoria: 'Tardivo', tipologiaId: 'TIP7', attiva: true }),
  withAudit({ id: 'V8', prodottoId: 'P2', codice: 'TAR', nome: 'Tarocco', categoria: 'Ibrido', tipologiaId: 'TIP8', attiva: true }),
  withAudit({ id: 'V9', prodottoId: 'P2', codice: 'ORO', nome: 'Orogros', categoria: 'Clementine', tipologiaId: 'TIP6', attiva: true })
];

export const INITIAL_ARTICOLI: Articolo[] = [
  withAudit({ id: 'ART1', codice: '10x500', nome: 'Cestini 10x500g (Bianca SS)', prodottoId: 'P1', categoria: 'Bianca Senza Semi', tipologiaId: 'TIP2', pesoColloTeorico: 5.0, tipoPeso: 'EGALIZZATO', attivo: true }),
  withAudit({ id: 'ART2', codice: '5KG', nome: 'Cartone 30x40 5kg (Rossa SS)', prodottoId: 'P1', categoria: 'Rossa Senza Semi', tipologiaId: 'TIP4', pesoColloTeorico: 5.0, tipoPeso: 'EGALIZZATO', attivo: true }),
  withAudit({ id: 'ART3', codice: 'SFUSO', nome: 'Plateau 60x40 Sfuso (Mista)', prodottoId: 'P1', pesoColloTeorico: 6.0, tipoPeso: 'USCENTE', attivo: true }),
  withAudit({ id: 'ART4', codice: 'FOG', nome: 'Mandarini con Foglia 2 Strati', prodottoId: 'P2', varietaId: 'V7', pesoColloTeorico: 10.0, tipoPeso: 'EGALIZZATO', attivo: true }),
  withAudit({ id: 'ART5', codice: 'RETE', nome: 'Mandarini Defogliati Rete 1kg', prodottoId: 'P2', categoria: 'Tardivo', tipologiaId: 'TIP7', pesoColloTeorico: 8.0, tipoPeso: 'EGALIZZATO', attivo: true })
];

export const INITIAL_SIGLE_LOTTO: SiglaLotto[] = [
  withAudit({ id: 'SL1', code: 'ROSSI-VIT-F01', produttore: 'Az. Rossi', varietaId: 'V2', campo: 'Fondo Valle' }),
  withAudit({ id: 'SL2', code: 'BIANCHI-CRI-F02', produttore: 'Az. Bianchi', varietaId: 'V4', campo: 'Poggio Alto' }),
  withAudit({ id: 'SL3', code: 'VERDI-NAD-F05', produttore: 'Az. Verdi', varietaId: 'V7', campo: 'Contrada X' })
];

export const INITIAL_IMBALLI: Imballo[] = [
  withAudit({ id: 'IMB1', codice: '3040', nome: 'Cartone 30x40', attivo: true }),
  withAudit({ id: 'IMB2', codice: '4060', nome: 'Cartone 40x60', attivo: true }),
  withAudit({ id: 'IMB3', codice: 'CPR', nome: 'CPR 6416', attivo: true }),
  withAudit({ id: 'IMB4', codice: 'IFCO', nome: 'IFCO Green', attivo: true }),
  withAudit({ id: 'IMB5', codice: 'LEGNO', nome: 'Padellina Legno', attivo: true })
];

export const INITIAL_TIPOLOGIE_SCARTO: TipologiaScarto[] = [
  withAudit({ id: 'TS1', codice: 'MAR', nome: 'Marcio', attiva: true }),
  withAudit({ id: 'TS2', codice: 'SOC', nome: 'Sotto Calibro', attiva: true }),
  withAudit({ id: 'TS3', codice: 'EST', nome: 'Difetto Estetico', attiva: true }),
  withAudit({ id: 'TS4', codice: 'DME', nome: 'Danni Meccanici', attiva: true })
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
