import { Area, Articolo, Imballo, Linea, Prodotto, SiglaLotto, TipologiaScarto, Varieta } from '../../../types';

export interface IMasterDataRepository {
  getAree(): Promise<Area[]>;
  getLinee(): Promise<Linea[]>;
  getProdotti(): Promise<Prodotto[]>;
  getVarieta(): Promise<Varieta[]>;
  getArticoli(): Promise<Articolo[]>;
  getSigleLotto(): Promise<SiglaLotto[]>;
  getImballi(): Promise<Imballo[]>;
  getTipologieScarto(): Promise<TipologiaScarto[]>;
  updateAree(aree: Area[]): Promise<void>;
  updateLinee(linee: Linea[]): Promise<void>;
  updateProdotti(prodotti: Prodotto[]): Promise<void>;
  updateVarieta(varieta: Varieta[]): Promise<void>;
  updateArticoli(articoli: Articolo[]): Promise<void>;
  updateSigleLotto(sigleLotto: SiglaLotto[]): Promise<void>;
  updateImballi(imballi: Imballo[]): Promise<void>;
  updateTipologieScarto(tipologieScarto: TipologiaScarto[]): Promise<void>;
}
