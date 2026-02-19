import { Articolo, Imballo, ProdottoGrezzo, Varieta } from '../../../types';

const normalizeCode = (code: string): string => code.trim().toUpperCase();

export class CodeUniquenessService {
  private isCodeUnique<T extends { id: string; codice: string }>(items: T[], code: string, excludeId?: string): boolean {
    const normalized = normalizeCode(code);
    return !items.some((item) => item.id !== excludeId && normalizeCode(item.codice) === normalized);
  }

  isProdottoCodeUnique(prodotti: ProdottoGrezzo[], code: string, excludeId?: string): boolean {
    return this.isCodeUnique(prodotti, code, excludeId);
  }

  isArticoloCodeUnique(articoli: Articolo[], code: string, excludeId?: string): boolean {
    return this.isCodeUnique(articoli, code, excludeId);
  }

  isImballoCodeUnique(imballi: Imballo[], code: string, excludeId?: string): boolean {
    return this.isCodeUnique(imballi, code, excludeId);
  }

  isVarietaCodeUniquePerProdotto(varieta: Varieta[], prodottoId: string, code: string, excludeId?: string): boolean {
    const normalized = normalizeCode(code);
    return !varieta.some(
      (item) => item.id !== excludeId && item.prodottoId === prodottoId && normalizeCode(item.codice) === normalized
    );
  }
}
