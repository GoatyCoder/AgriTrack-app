import { SessioneProduzione } from '../../../types';
import { ITurnoRepository } from '../interfaces/ITurnoRepository';
import { readState, writeState } from './stateStorage';

export class LocalStorageTurnoRepository implements ITurnoRepository {
  async getAll(): Promise<SessioneProduzione[]> {
    return readState().sessioniProduzione;
  }

  async getById(id: string): Promise<SessioneProduzione | null> {
    return (await this.getAll()).find(t => t.id === id) || null;
  }

  async getActive(): Promise<SessioneProduzione | null> {
    return (await this.getAll()).find(t => t.status === 'APERTO' || t.status === 'PAUSA') || null;
  }

  async create(turno: SessioneProduzione): Promise<SessioneProduzione> {
    const state = readState();
    state.sessioniProduzione.push(turno);
    writeState(state);
    return turno;
  }

  async update(turno: SessioneProduzione): Promise<SessioneProduzione> {
    const state = readState();
    state.sessioniProduzione = state.sessioniProduzione.map(t => (t.id === turno.id ? turno : t));
    writeState(state);
    return turno;
  }

  async delete(id: string): Promise<void> {
    const state = readState();
    state.sessioniProduzione = state.sessioniProduzione.filter(t => t.id !== id);
    writeState(state);
  }
}
