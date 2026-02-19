import { Articolo, Imballo, ProdottoGrezzo, Varieta } from '../../../types';

const normalizeCode = (code: string): string => code.trim().toUpperCase();

export class CodeUniquenessService {
  isProdottoCodeUnique(prodotti: ProdottoGrezzo[], code: string, excludeId?: string): boolean {
    const normalized = normalizeCode(code);
    return !prodotti.some((prodotto) => prodotto.id !== excludeId && normalizeCode(prodotto.codice) === normalized);
  }

  isArticoloCodeUnique(articoli: Articolo[], code: string, excludeId?: string): boolean {
    const normalized = normalizeCode(code);
    return !articoli.some((articolo) => articolo.id !== excludeId && normalizeCode(articolo.codice) === normalized);
  }

  isImballoCodeUnique(imballi: Imballo[], code: string, excludeId?: string): boolean {
    const normalized = normalizeCode(code);
    return !imballi.some((imballo) => imballo.id !== excludeId && normalizeCode(imballo.codice) === normalized);
  }

  isVarietaCodeUniquePerProdotto(varieta: Varieta[], prodottoId: string, code: string, excludeId?: string): boolean {
    const normalized = normalizeCode(code);
    return !varieta.some(
      (item) => item.id !== excludeId && item.prodottoId === prodottoId && normalizeCode(item.codice) === normalized
    );
  }
}
