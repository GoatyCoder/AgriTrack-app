import { Turno } from '../../../types';
import { ITurnoRepository } from '../interfaces/ITurnoRepository';
import { readState, writeState } from './stateStorage';

export class LocalStorageTurnoRepository implements ITurnoRepository {
  async getAll(): Promise<Turno[]> {
    return readState().turni;
  }

  async getById(id: string): Promise<Turno | null> {
    return (await this.getAll()).find(t => t.id === id) || null;
  }

  async getActive(): Promise<Turno | null> {
    return (await this.getAll()).find(t => t.status === 'APERTO' || t.status === 'PAUSA') || null;
  }

  async create(turno: Turno): Promise<Turno> {
    const state = readState();
    state.turni.push(turno);
    writeState(state);
    return turno;
  }

  async update(turno: Turno): Promise<Turno> {
    const state = readState();
    state.turni = state.turni.map(t => (t.id === turno.id ? turno : t));
    writeState(state);
    return turno;
  }

  async delete(id: string): Promise<void> {
    const state = readState();
    state.turni = state.turni.filter(t => t.id !== id);
    writeState(state);
  }
}
