import { Pedana } from '../../../types';
import { IPedanaRepository } from '../interfaces/IPedanaRepository';
import { readState, writeState } from './stateStorage';

export class LocalStoragePedanaRepository implements IPedanaRepository {
  async getAll(): Promise<Pedana[]> {
    return readState().pedane;
  }

  async getById(id: string): Promise<Pedana | null> {
    return (await this.getAll()).find(p => p.id === id) || null;
  }

  async getBySessione(sessioneId: string): Promise<Pedana[]> {
    return (await this.getAll()).filter(p => p.sessioneId === sessioneId);
  }

  async getByDay(date: Date): Promise<Pedana[]> {
    const day = date.toISOString().split('T')[0];
    return (await this.getAll()).filter(p => p.timestamp.startsWith(day));
  }

  async create(pedana: Pedana): Promise<Pedana> {
    const state = readState();
    state.pedane.push(pedana);
    writeState(state);
    return pedana;
  }

  async delete(id: string): Promise<void> {
    const state = readState();
    state.pedane = state.pedane.filter(p => p.id !== id);
    writeState(state);
  }
}
