import React from 'react';
import { Archive, ArrowDown, ArrowUp, Clock, Filter, Pause, Pencil, Play, Plus, RefreshCw, RotateCcw, Square, Trash2, XCircle } from 'lucide-react';
import SessionCard from '../../components/SessionCard';
import SmartSelect from '../../components/SmartSelect';
import { AppState, SessioneLinea, Turno } from '../../types';
import { formatDateTime, formatTime } from '../../utils';

interface MonitorPageProps {
  activeTurno: Turno;
  state: AppState;
  getAreaNome: (areaId: string) => string;
  getLineaNome: (lineaId: string) => string;
  handleTogglePauseTurno: () => void;
  setIsScartoModalOpen: (v: boolean) => void;
  setIsNewSessionMode: (v: boolean) => void;
  isNewSessionMode: boolean;
  newSessionData: { areaId: string; lineaId: string; articoloId: string; siglaLottoId: string; dataIngresso: string };
  setNewSessionData: React.Dispatch<React.SetStateAction<{ areaId: string; lineaId: string; articoloId: string; siglaLottoId: string; dataIngresso: string }>>;
  lottoOptions: any[];
  filteredArticoli: any[];
  handleStartSession: (data: { areaId: string; lineaId: string; articoloId: string; siglaLottoId: string; dataIngresso: string }) => void;
  activeSessions: SessioneLinea[];
  setSelectedSessionId: (id: string) => void;
  setIsPedanaModalOpen: (v: boolean) => void;
  handleCloseSession: (id: string) => void;
  handleDeleteSession: (id: string) => void;
  handleOpenSwitchLotto: (session: SessioneLinea) => void;
  handleEditSession: (session: SessioneLinea) => void;
  handleTogglePauseSession: (id: string) => void;
  processedSessions: any[];
  hasActiveFilters: boolean;
  clearFilters: () => void;
  showFilters: boolean;
  setShowFilters: (v: boolean) => void;
  timeFilter: { mode: 'AFTER' | 'BEFORE' | 'RANGE'; start: string; end: string };
  setTimeFilter: React.Dispatch<React.SetStateAction<{ mode: 'AFTER' | 'BEFORE' | 'RANGE'; start: string; end: string }>>;
  filters: { linea: string; articolo: string; lotto: string; stato: string; note: string };
  setFilters: React.Dispatch<React.SetStateAction<{ linea: string; articolo: string; lotto: string; stato: string; note: string }>>;
  sortConfig: { key: string; direction: 'asc' | 'desc' } | null;
  handleSort: (key: string) => void;
  editingCell: { sessionId: string; field: 'inizio' | 'fine' | 'note' } | null;
  setEditingCell: (v: { sessionId: string; field: 'inizio' | 'fine' | 'note' } | null) => void;
  handleCellSave: (sessionId: string, field: 'inizio' | 'fine' | 'note', value: string) => void;
}

export const MonitorPage: React.FC<MonitorPageProps> = (props) => {
  const renderSortableHeader = (label: string, key: string, widthClass = '') => {
    const isSorted = props.sortConfig?.key === key;
    return (
      <th className={`px-6 py-3 text-left font-medium text-gray-500 cursor-pointer hover:text-agri-600 transition-colors whitespace-nowrap ${widthClass}`} onClick={() => props.handleSort(key)}>
        <div className="flex items-center gap-1">
          {label}
          <div className={`w-4 flex justify-center transition-opacity ${isSorted ? 'opacity-100' : 'opacity-0'}`}>
            {isSorted && (props.sortConfig!.direction === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />)}
            {!isSorted && <div className="w-3 h-3" />}
          </div>
        </div>
      </th>
    );
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <div>
            <span className={`text-xs font-bold px-2 py-1 rounded uppercase tracking-wider ${props.activeTurno.status === 'PAUSA' ? 'bg-amber-100 text-amber-800' : 'bg-agri-100 text-agri-800'}`}>{props.activeTurno.status === 'PAUSA' ? 'Turno in Pausa' : 'Turno Attivo'}</span>
            <h2 className="text-3xl font-black text-gray-900 mt-1">Produzione</h2>
            <p className="text-gray-500 text-sm">Area: {props.getAreaNome(props.activeTurno.areaId)} • Op: {props.activeTurno.operatore} • Inizio: {formatTime(props.activeTurno.inizio)}</p>
          </div>
          <button onClick={props.handleTogglePauseTurno} className={`p-3 rounded-full shadow-md transition-all ${props.activeTurno.status === 'PAUSA' ? 'bg-agri-600 text-white hover:bg-agri-700' : 'bg-amber-500 text-white hover:bg-amber-600'}`}>
            {props.activeTurno.status === 'PAUSA' ? <Play size={24} fill="currentColor" /> : <Pause size={24} fill="currentColor" />}
          </button>
        </div>

        <div className="flex gap-3 w-full md:w-auto">
          <button onClick={() => props.setIsScartoModalOpen(true)} className="flex-1 md:flex-none bg-white border-2 border-red-100 hover:border-red-300 text-red-600 font-bold px-4 py-3 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"><Plus size={16} /> Scarto</button>
          <button onClick={() => props.setIsNewSessionMode(true)} className="flex-1 md:flex-none bg-gray-900 hover:bg-gray-800 text-white font-bold px-4 py-3 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"><Plus size={20} /> Nuova Sessione</button>
        </div>
      </div>

      {props.isNewSessionMode && (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-agri-100 animate-in slide-in-from-top-4">
          <h3 className="font-bold text-lg mb-4 text-gray-800">Avvia Nuova Sessione</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Area</label>
              <select className="w-full p-2 border border-gray-300 rounded-lg font-medium" value={props.newSessionData.areaId} onChange={e => props.setNewSessionData({ ...props.newSessionData, areaId: e.target.value, lineaId: props.state.linee.find(l => l.areaId === e.target.value)?.id || '' })}>
                {props.state.aree.filter(a => a.attiva !== false).map(a => <option key={a.id} value={a.id}>{a.nome}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Linea</label>
              <select className="w-full p-2 border border-gray-300 rounded-lg font-medium" value={props.newSessionData.lineaId} onChange={e => props.setNewSessionData({ ...props.newSessionData, lineaId: e.target.value })}>
                {props.state.linee.filter(l => l.areaId === props.newSessionData.areaId && l.attiva !== false).map(l => <option key={l.id} value={l.id}>{l.nome}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Data Ingresso</label>
              <input type="date" className="w-full p-2 border border-gray-300 rounded-lg font-medium" value={props.newSessionData.dataIngresso} onChange={e => props.setNewSessionData({ ...props.newSessionData, dataIngresso: e.target.value })} />
            </div>
            <div><SmartSelect label="Sigla Lotto" options={props.lottoOptions} value={props.newSessionData.siglaLottoId} onSelect={(id) => props.setNewSessionData({ ...props.newSessionData, siglaLottoId: id, articoloId: '' })} placeholder="Lotto..." /></div>
            <div><SmartSelect label="Articolo" options={props.filteredArticoli} value={props.newSessionData.articoloId} onSelect={(id) => props.setNewSessionData({ ...props.newSessionData, articoloId: id })} placeholder="Articolo..." disabled={!props.newSessionData.siglaLottoId} /></div>
          </div>
          <div className="flex justify-end gap-3">
            <button onClick={() => props.setIsNewSessionMode(false)} className="px-4 py-2 text-gray-500 font-medium">Annulla</button>
            <button onClick={() => props.handleStartSession(props.newSessionData)} className="px-6 py-2 bg-agri-600 text-white rounded-lg font-bold shadow hover:bg-agri-700">Avvia Sessione</button>
          </div>
        </div>
      )}

      {props.activeSessions.length === 0 ? <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300"><h3 className="text-xl text-gray-400 font-bold mb-2">Nessuna sessione attiva.</h3><p className="text-gray-400">Clicca \"Nuova Sessione\" per iniziare.</p></div> : (
        <div className="grid md:grid-cols-2 gap-6">
          {props.activeSessions.map(session => {
            const articolo = props.state.articoli.find(a => a.id === session.articoloId)!;
            const lottoCode = props.state.sigleLotto.find(s => s.id === session.siglaLottoId)?.code || '???';
            return <SessionCard key={session.id} sessione={session} articolo={articolo} dataIngresso={session.dataIngresso} siglaLottoCode={lottoCode} pedaneSessione={props.state.pedane.filter(p => p.sessioneId === session.id)} onAddPedana={() => { props.setSelectedSessionId(session.id); props.setIsPedanaModalOpen(true); }} onCloseSession={() => props.handleCloseSession(session.id)} onDeleteSession={() => props.handleDeleteSession(session.id)} onChangeLotto={() => props.handleOpenSwitchLotto(session)} onEditSession={() => props.handleEditSession(session)} onTogglePause={() => props.handleTogglePauseSession(session.id)} lineaLabel={props.getLineaNome(session.lineaId)} />;
          })}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-2"><Archive size={18} className="text-gray-500"/><h3 className="font-bold text-gray-700">Storico Sessioni Turno</h3></div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500 font-medium border-r border-gray-300 pr-4">{props.processedSessions.length} sessioni</span>
            {props.hasActiveFilters && <button onClick={props.clearFilters} className="text-orange-500 hover:text-orange-600 transition-colors" title="Resetta Filtri"><RotateCcw size={20} /></button>}
            <button onClick={() => props.setShowFilters(!props.showFilters)} className={`p-1.5 rounded-lg transition-colors ${props.showFilters ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}><Filter size={20} /></button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {renderSortableHeader('Inizio/Fine', 'inizio', 'w-[140px]')}
                {renderSortableHeader('Linea', 'lineaId', 'w-[100px]')}
                {renderSortableHeader('Articolo', 'articoloNome', 'w-auto')}
                {renderSortableHeader('Lotto', 'lottoCodice', 'w-[180px]')}
                {renderSortableHeader('Stato', 'stato', 'w-[100px]')}
                {renderSortableHeader('Note', 'note', 'w-[200px]')}
                <th className="px-6 py-3 text-right font-medium text-gray-500 w-[160px]">Azioni</th>
              </tr>
              {props.showFilters && (
                <tr className="bg-white border-b border-gray-200">
                  <td className="px-6 py-2 align-top"><div className="flex flex-col gap-1"><select className="w-full p-1 border border-gray-200 rounded text-xs bg-gray-50 focus:border-agri-500 focus:ring-1 focus:ring-agri-500 font-bold" value={props.timeFilter.mode} onChange={(e: any) => props.setTimeFilter({ ...props.timeFilter, mode: e.target.value })}><option value="RANGE">Tra le... e le...</option><option value="AFTER">Dopo le...</option><option value="BEFORE">Prima delle...</option></select><div className="flex gap-1"><input type="time" className="w-full p-1 border border-gray-200 rounded text-xs focus:border-agri-500 focus:ring-1 focus:ring-agri-500" value={props.timeFilter.start} onChange={e => props.setTimeFilter({ ...props.timeFilter, start: e.target.value })} />{props.timeFilter.mode === 'RANGE' && (<input type="time" className="w-full p-1 border border-gray-200 rounded text-xs focus:border-agri-500 focus:ring-1 focus:ring-agri-500" value={props.timeFilter.end} onChange={e => props.setTimeFilter({ ...props.timeFilter, end: e.target.value })} />)}</div></div></td>
                  <td className="px-6 py-2 align-top"><select className="w-full p-1.5 border border-gray-200 rounded text-xs bg-gray-50 font-bold focus:border-agri-500 focus:ring-1 focus:ring-agri-500" value={props.filters.linea} onChange={e => props.setFilters({ ...props.filters, linea: e.target.value })}><option value="">Tutte</option>{props.state.linee.map(l => <option key={l.id} value={l.id}>{l.nome}</option>)}</select></td>
                  <td className="px-6 py-2 align-top"><input type="text" className="w-full p-1.5 border border-gray-200 rounded text-xs bg-gray-50 focus:border-agri-500 focus:ring-1 focus:ring-agri-500" placeholder="Cerca..." value={props.filters.articolo} onChange={e => props.setFilters({ ...props.filters, articolo: e.target.value })} /></td>
                  <td className="px-6 py-2 align-top"><input type="text" className="w-full p-1.5 border border-gray-200 rounded text-xs bg-gray-50 focus:border-agri-500 focus:ring-1 focus:ring-agri-500" placeholder="Cerca..." value={props.filters.lotto} onChange={e => props.setFilters({ ...props.filters, lotto: e.target.value })} /></td>
                  <td className="px-6 py-2 align-top"><select className="w-full p-1.5 border border-gray-200 rounded text-xs bg-gray-50 font-bold focus:border-agri-500 focus:ring-1 focus:ring-agri-500" value={props.filters.stato} onChange={e => props.setFilters({ ...props.filters, stato: e.target.value })}><option value="">Tutti</option><option value="ATTIVA">ATTIVA</option><option value="PAUSA">PAUSA</option><option value="CHIUSA">CHIUSA</option></select></td>
                  <td className="px-6 py-2 align-top"><input type="text" className="w-full p-1.5 border border-gray-200 rounded text-xs bg-gray-50 focus:border-agri-500 focus:ring-1 focus:ring-agri-500" placeholder="Cerca note..." value={props.filters.note} onChange={e => props.setFilters({ ...props.filters, note: e.target.value })} /></td>
                  <td className="px-6 py-2 text-right"><button onClick={props.clearFilters} className="text-gray-400 hover:text-red-500" title="Cancella filtri"><XCircle size={16} /></button></td>
                </tr>
              )}
            </thead>
            <tbody className="divide-y divide-gray-100">
              {props.processedSessions.map((session) => {
                const art = props.state.articoli.find(a => a.id === session.articoloId);
                return (
                  <tr key={session.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-3 font-mono text-xs text-gray-600 whitespace-nowrap">
                      <span className="flex items-center gap-1"><Clock size={12} className="text-gray-400" />
                      {props.editingCell?.sessionId === session.id && props.editingCell?.field === 'inizio' ? (
                        <input type="time" className="border rounded p-1 text-xs" defaultValue={new Date(session.inizio).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })} autoFocus onBlur={(e) => props.handleCellSave(session.id, 'inizio', e.target.value)} onKeyDown={(e) => e.key === 'Enter' && props.handleCellSave(session.id, 'inizio', e.currentTarget.value)} />
                      ) : (
                        <span className="cursor-pointer" onClick={() => props.setEditingCell({ sessionId: session.id, field: 'inizio' })} title={formatDateTime(session.inizio)}>{formatTime(session.inizio)}</span>
                      )}
                      <span className="mx-1">-</span>
                      {session.fine ? (
                        props.editingCell?.sessionId === session.id && props.editingCell?.field === 'fine' ? (
                          <input type="time" className="border rounded p-1 text-xs" defaultValue={new Date(session.fine).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })} autoFocus onBlur={(e) => props.handleCellSave(session.id, 'fine', e.target.value)} onKeyDown={(e) => e.key === 'Enter' && props.handleCellSave(session.id, 'fine', e.currentTarget.value)} />
                        ) : (
                          <span className="cursor-pointer" onClick={() => props.setEditingCell({ sessionId: session.id, field: 'fine' })} title={formatDateTime(session.fine)}>{formatTime(session.fine)}</span>
                        )
                      ) : '...'}
                      </span>
                    </td>
                    <td className="px-6 py-3 font-medium">{props.getLineaNome(session.lineaId)}</td>
                    <td className="px-6 py-3">{art?.nome}</td>
                    <td className="px-6 py-3 font-mono text-xs">{session.lottoCodice}</td>
                    <td className="px-6 py-3"><span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${session.status === 'ATTIVA' ? 'bg-green-100 text-green-800' : session.status === 'PAUSA' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'}`}>{session.status}</span></td>
                    <td className="px-6 py-3 text-gray-500 italic truncate max-w-[100px]">
                      {props.editingCell?.sessionId === session.id && props.editingCell?.field === 'note' ? (
                        <input type="text" className="w-full border rounded p-1 text-xs" defaultValue={session.note || ''} autoFocus onBlur={(e) => props.handleCellSave(session.id, 'note', e.target.value)} onKeyDown={(e) => e.key === 'Enter' && props.handleCellSave(session.id, 'note', e.currentTarget.value)} />
                      ) : (
                        <span className="cursor-pointer block min-h-[20px]" onClick={() => props.setEditingCell({ sessionId: session.id, field: 'note' })} title={session.note || 'Clicca per aggiungere nota'}>{session.note || <span className="text-gray-300 text-xs">Aggiungi...</span>}</span>
                      )}
                    </td>
                    <td className="px-6 py-3 text-right flex justify-end items-center gap-2">
                      {session.status !== 'CHIUSA' && <>
                        <button onClick={() => props.handleTogglePauseSession(session.id)} className={`p-1 transition-colors ${session.status === 'PAUSA' ? 'text-agri-600 hover:text-agri-700' : 'text-amber-500 hover:text-amber-600'}`} title={session.status === 'PAUSA' ? 'Riprendi' : 'Metti in Pausa'}>{session.status === 'PAUSA' ? <Play size={16} fill="currentColor" /> : <Pause size={16} fill="currentColor" />}</button>
                        <button onClick={() => props.handleCloseSession(session.id)} className="text-red-500 hover:text-red-700 p-1" title="Chiudi"><Square size={16} fill="currentColor" /></button>
                        <button onClick={() => props.handleOpenSwitchLotto(session)} className="text-gray-400 hover:text-agri-600 p-1" title="Cambio Lotto"><RefreshCw size={16} /></button>
                      </>}
                      <button onClick={() => props.handleEditSession(session)} className="text-gray-400 hover:text-orange-600 p-1" title="Modifica"><Pencil size={16} /></button>
                      <button onClick={() => props.handleDeleteSession(session.id)} className="text-gray-400 hover:text-red-600 p-1" title="Elimina Definitivamente"><Trash2 size={16} /></button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
