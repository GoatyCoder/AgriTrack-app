import { Articolo, Imballo, Pedana, SessioneLinea, SiglaLotto } from '../../../types';

export class PedanaFactory {
  create(params: {
    sessione: SessioneLinea;
    articolo: Articolo;
    lotto: SiglaLotto;
    imballo?: Imballo;
    stickerCode: string;
    doy: number;
    seq: number;
    numeroColli: number;
    pesoTotale: number;
    calibro?: string;
  }): Pedana {
    return {
      id: crypto.randomUUID(),
      sessioneId: params.sessione.id,
      stickerCode: params.stickerCode,
      doy: params.doy,
      seq: params.seq,
      numeroColli: params.numeroColli,
      pesoTotale: params.pesoTotale,
      timestamp: new Date().toISOString(),
      imballoId: params.imballo?.id,
      calibro: params.calibro,
      snapshotImballo: params.imballo ? { codice: params.imballo.codice, nome: params.imballo.nome } : undefined,
      snapshotArticolo: { id: params.articolo.id, nome: params.articolo.nome, codice: params.articolo.codice },
      snapshotIngresso: {
        siglaLottoId: params.lotto.id,
        lottoCode: params.lotto.code,
        dataIngresso: params.sessione.dataIngresso
      }
    };
  }
}
