import { Area, Articolo, Imballo, Linea, ProdottoGrezzo, SiglaLotto, TipologiaScarto, Varieta } from '../../../types';

export interface IMasterDataRepository {
  getAree(): Promise<Area[]>;
  getLinee(): Promise<Linea[]>;
  getProdotti(): Promise<ProdottoGrezzo[]>;
  getVarieta(): Promise<Varieta[]>;
  getArticoli(): Promise<Articolo[]>;
  getSigleLotto(): Promise<SiglaLotto[]>;
  getImballi(): Promise<Imballo[]>;
  getTipologieScarto(): Promise<TipologiaScarto[]>;
  updateAree(aree: Area[]): Promise<void>;
  updateLinee(linee: Linea[]): Promise<void>;
  updateProdotti(prodotti: ProdottoGrezzo[]): Promise<void>;
  updateVarieta(varieta: Varieta[]): Promise<void>;
  updateArticoli(articoli: Articolo[]): Promise<void>;
  updateSigleLotto(sigleLotto: SiglaLotto[]): Promise<void>;
  updateImballi(imballi: Imballo[]): Promise<void>;
  updateTipologieScarto(tipologieScarto: TipologiaScarto[]): Promise<void>;
}
