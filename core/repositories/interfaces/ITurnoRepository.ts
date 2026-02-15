import { SessioneProduzione } from '../../../types';

export interface ITurnoRepository {
  getAll(): Promise<SessioneProduzione[]>;
  getById(id: string): Promise<SessioneProduzione | null>;
  getActive(): Promise<SessioneProduzione | null>;
  create(turno: SessioneProduzione): Promise<SessioneProduzione>;
  update(turno: SessioneProduzione): Promise<SessioneProduzione>;
  delete(id: string): Promise<void>;
}
