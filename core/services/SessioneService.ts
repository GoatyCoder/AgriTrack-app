import { SessioneLinea } from '../../types';

export const buildSessione = (params: {
  turnoId: string;
  lineaId: string;
  articoloId: string;
  siglaLottoId: string;
  dataIngresso: string;
}): SessioneLinea => ({
  id: crypto.randomUUID(),
  turnoId: params.turnoId,
  lineaId: params.lineaId,
  articoloId: params.articoloId,
  siglaLottoId: params.siglaLottoId,
  dataIngresso: params.dataIngresso,
  inizio: new Date().toISOString(),
  status: 'ATTIVA',
  pause: [],
  note: ''
});

export const getLineConflicts = (activeSessions: SessioneLinea[], lineaId: string): SessioneLinea[] =>
  activeSessions.filter(s => s.lineaId === lineaId);
