import { Articolo, SiglaLotto, Varieta } from '../../../types';

export class ArticoloLottoCompatibilityService {
  isCompatible(articolo: Articolo | undefined, lotto: SiglaLotto | undefined, varieta: Varieta | undefined): boolean {
    if (!articolo || !lotto || !varieta) return false;
    if (!articolo.prodottoId) return true;
    if (articolo.prodottoId !== varieta.prodottoId) return false;
    if (articolo.varietaId && articolo.varietaId !== varieta.id) return false;

    const articoloTipologia = articolo.tipologiaId || articolo.categoria;
    const varietaTipologia = varieta.tipologiaId || varieta.categoria;
    if (articoloTipologia && articoloTipologia !== varietaTipologia) return false;
    return true;
  }

  getCompatibleLotti(articolo: Articolo | undefined, lotti: SiglaLotto[], varieta: Varieta[]): SiglaLotto[] {
    if (!articolo) return [];
    return lotti.filter(lotto => {
      const v = varieta.find(item => item.id === lotto.varietaId);
      return this.isCompatible(articolo, lotto, v);
    });
  }
}
