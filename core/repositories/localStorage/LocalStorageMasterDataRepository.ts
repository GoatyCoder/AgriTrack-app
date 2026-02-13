import { Area, Articolo, Imballo, Linea, Prodotto, SiglaLotto, TipologiaScarto, Varieta } from '../../../types';
import { IMasterDataRepository } from '../interfaces/IMasterDataRepository';
import { readState, writeState } from './stateStorage';

export class LocalStorageMasterDataRepository implements IMasterDataRepository {
  async getAree(): Promise<Area[]> { return readState().aree; }
  async getLinee(): Promise<Linea[]> { return readState().linee; }
  async getProdotti(): Promise<Prodotto[]> { return readState().prodotti; }
  async getVarieta(): Promise<Varieta[]> { return readState().varieta; }
  async getArticoli(): Promise<Articolo[]> { return readState().articoli; }
  async getSigleLotto(): Promise<SiglaLotto[]> { return readState().sigleLotto; }
  async getImballi(): Promise<Imballo[]> { return readState().imballi; }
  async getTipologieScarto(): Promise<TipologiaScarto[]> { return readState().tipologieScarto; }

  async updateAree(aree: Area[]): Promise<void> { const s = readState(); s.aree = aree; writeState(s); }
  async updateLinee(linee: Linea[]): Promise<void> { const s = readState(); s.linee = linee; writeState(s); }
  async updateProdotti(prodotti: Prodotto[]): Promise<void> { const s = readState(); s.prodotti = prodotti; writeState(s); }
  async updateVarieta(varieta: Varieta[]): Promise<void> { const s = readState(); s.varieta = varieta; writeState(s); }
  async updateArticoli(articoli: Articolo[]): Promise<void> { const s = readState(); s.articoli = articoli; writeState(s); }
  async updateSigleLotto(sigleLotto: SiglaLotto[]): Promise<void> { const s = readState(); s.sigleLotto = sigleLotto; writeState(s); }
  async updateImballi(imballi: Imballo[]): Promise<void> { const s = readState(); s.imballi = imballi; writeState(s); }
  async updateTipologieScarto(tipologieScarto: TipologiaScarto[]): Promise<void> { const s = readState(); s.tipologieScarto = tipologieScarto; writeState(s); }
}
