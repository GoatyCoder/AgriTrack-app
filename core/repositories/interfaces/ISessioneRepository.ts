import { SessioneLinea } from '../../../types';

export interface ISessioneRepository {
  getAll(): Promise<SessioneLinea[]>;
  getById(id: string): Promise<SessioneLinea | null>;
  getByTurno(turnoId: string): Promise<SessioneLinea[]>;
  getActiveByLinea(lineaId: string): Promise<SessioneLinea[]>;
  create(sessione: SessioneLinea): Promise<SessioneLinea>;
  update(sessione: SessioneLinea): Promise<SessioneLinea>;
  delete(id: string): Promise<void>;
}
