import { Lavorazione } from '../../types';

export const buildSessione = (params: {
  sessioneProduzioneId: string;
  lineaId: string;
  articoloId: string;
  siglaLottoId: string;
  dataIngresso: string;
  doyIngresso?: number;
  imballoId?: string;
  pesoColloStandard?: number;
  categoria?: string;
  calibro?: string;
  note?: string;
  noteSticker?: string;
}): Lavorazione => ({
  id: crypto.randomUUID(),
  sessioneProduzioneId: params.sessioneProduzioneId,
  lineaId: params.lineaId,
  articoloId: params.articoloId,
  siglaLottoId: params.siglaLottoId,
  dataIngresso: params.dataIngresso,
  doyIngresso: params.doyIngresso,
  imballoId: params.imballoId,
  pesoColloStandard: params.pesoColloStandard,
  categoria: params.categoria,
  calibro: params.calibro,
  noteSticker: params.noteSticker,
  inizio: new Date().toISOString(),
  status: 'ATTIVA',
  pause: [],
  note: params.note || ''
});

export const getLineConflicts = (activeSessions: Lavorazione[], lineaId: string): Lavorazione[] =>
  activeSessions.filter(s => s.lineaId === lineaId);
