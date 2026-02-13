import { SessioneLinea } from '../../../types';

export class SessioneConflictService {
  findConflicts(lineaId: string, activeSessions: SessioneLinea[]): SessioneLinea[] {
    return activeSessions.filter(s => s.lineaId === lineaId && s.status !== 'CHIUSA');
  }
}
