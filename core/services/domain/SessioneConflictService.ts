import { Lavorazione } from '../../../types';

export class SessioneConflictService {
  findConflicts(lineaId: string, activeSessions: Lavorazione[]): Lavorazione[] {
    return activeSessions.filter(s => s.lineaId === lineaId && s.status !== 'CHIUSA');
  }
}
