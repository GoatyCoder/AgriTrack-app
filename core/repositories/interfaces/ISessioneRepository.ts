import { Lavorazione } from '../../../types';

export interface ISessioneRepository {
  getAll(): Promise<Lavorazione[]>;
  getById(id: string): Promise<Lavorazione | null>;
  getBySessioneProduzione(sessioneProduzioneId: string): Promise<Lavorazione[]>;
  getActiveByLinea(lineaId: string): Promise<Lavorazione[]>;
  create(sessione: Lavorazione): Promise<Lavorazione>;
  update(sessione: Lavorazione): Promise<Lavorazione>;
  delete(id: string): Promise<void>;
}
