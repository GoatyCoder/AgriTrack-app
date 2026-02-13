import { Scarto } from '../../../types';

export interface IScartoRepository {
  getAll(): Promise<Scarto[]>;
  getByTurno(turnoId: string): Promise<Scarto[]>;
  create(scarto: Scarto): Promise<Scarto>;
  delete(id: string): Promise<void>;
}
