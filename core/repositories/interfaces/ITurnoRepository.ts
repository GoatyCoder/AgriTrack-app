import { Turno } from '../../../types';

export interface ITurnoRepository {
  getAll(): Promise<Turno[]>;
  getById(id: string): Promise<Turno | null>;
  getActive(): Promise<Turno | null>;
  create(turno: Turno): Promise<Turno>;
  update(turno: Turno): Promise<Turno>;
  delete(id: string): Promise<void>;
}
