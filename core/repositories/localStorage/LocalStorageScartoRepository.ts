import { Scarto } from '../../../types';
import { IScartoRepository } from '../interfaces/IScartoRepository';
import { readState, writeState } from './stateStorage';

export class LocalStorageScartoRepository implements IScartoRepository {
  async getAll(): Promise<Scarto[]> {
    return readState().scarti;
  }

  async getByTurno(turnoId: string): Promise<Scarto[]> {
    return (await this.getAll()).filter(s => s.turnoId === turnoId);
  }

  async create(scarto: Scarto): Promise<Scarto> {
    const state = readState();
    state.scarti.push(scarto);
    writeState(state);
    return scarto;
  }

  async delete(id: string): Promise<void> {
    const state = readState();
    state.scarti = state.scarti.filter(s => s.id !== id);
    writeState(state);
  }
}
