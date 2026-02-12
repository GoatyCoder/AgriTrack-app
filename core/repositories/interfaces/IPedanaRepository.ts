import { Pedana } from '../../../types';

export interface IPedanaRepository {
  getAll(): Promise<Pedana[]>;
  getById(id: string): Promise<Pedana | null>;
  getBySessione(sessioneId: string): Promise<Pedana[]>;
  getByDay(date: Date): Promise<Pedana[]>;
  create(pedana: Pedana): Promise<Pedana>;
  delete(id: string): Promise<void>;
}
