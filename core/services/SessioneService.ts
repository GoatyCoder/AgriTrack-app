import { Lavorazione } from '../../types';

export const buildSessione = (params: {
  sessioneProduzioneId: string;
  lineaId: string;
  articoloId: string;
  siglaLottoId: string;
  dataIngresso: string;
}): Lavorazione => ({
  id: crypto.randomUUID(),
  sessioneProduzioneId: params.sessioneProduzioneId,
  lineaId: params.lineaId,
  articoloId: params.articoloId,
  siglaLottoId: params.siglaLottoId,
  dataIngresso: params.dataIngresso,
  inizio: new Date().toISOString(),
  status: 'ATTIVA',
  pause: [],
  note: ''
});

export const getLineConflicts = (activeSessions: Lavorazione[], lineaId: string): Lavorazione[] =>
  activeSessions.filter(s => s.lineaId === lineaId);
