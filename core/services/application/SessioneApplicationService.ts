import { ISessioneRepository } from '../../repositories/interfaces/ISessioneRepository';
import { ITurnoRepository } from '../../repositories/interfaces/ITurnoRepository';
import { IMasterDataRepository } from '../../repositories/interfaces/IMasterDataRepository';
import { SessioneLinea } from '../../../types';
import { buildSessione } from '../SessioneService';
import { ArticoloLottoCompatibilityService } from '../domain/ArticoloLottoCompatibilityService';
import { SessioneConflictService } from '../domain/SessioneConflictService';

export class SessioneApplicationService {
  constructor(
    private sessioneRepo: ISessioneRepository,
    private turnoRepo: ITurnoRepository,
    private masterDataRepo: IMasterDataRepository,
    private compatibilityService = new ArticoloLottoCompatibilityService(),
    private conflictService = new SessioneConflictService()
  ) {}

  async startSessione(params: {
    turnoId: string;
    lineaId: string;
    articoloId: string;
    siglaLottoId: string;
    dataIngresso: string;
  }): Promise<{ sessione: SessioneLinea; conflicts: SessioneLinea[] }> {
    const turno = await this.turnoRepo.getById(params.turnoId);
    if (!turno || turno.status === 'CHIUSO') throw new Error('R2.3: Turno non valido');

    const [articoli, lotti, varieta] = await Promise.all([
      this.masterDataRepo.getArticoli(),
      this.masterDataRepo.getSigleLotto(),
      this.masterDataRepo.getVarieta()
    ]);

    const articolo = articoli.find(a => a.id === params.articoloId);
    const lotto = lotti.find(l => l.id === params.siglaLottoId);
    const v = varieta.find(item => item.id === lotto?.varietaId);

    if (!this.compatibilityService.isCompatible(articolo, lotto, v)) {
      throw new Error('R2.1: Articolo non compatibile con lotto');
    }

    const activeLineSessions = await this.sessioneRepo.getActiveByLinea(params.lineaId);
    const conflicts = this.conflictService.findConflicts(params.lineaId, activeLineSessions);

    const sessione = buildSessione({ ...params, sessioneProduzioneId: params.turnoId });
    return { sessione, conflicts };
  }
}
