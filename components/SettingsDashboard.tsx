import React, { useEffect, useMemo, useState } from 'react';
import { Package, Tags, Box, Sprout, Apple, Plus, Pencil, RotateCcw, Factory, Ruler, Layers } from 'lucide-react';
import { AppState, Articolo, SiglaLotto, ProdottoGrezzo, Varieta, Imballo, Area, Linea, Tipologia, Calibro } from '../types';
import { useDialog } from './DialogContext';

interface SettingsDashboardProps {
  data: AppState;
  onUpdateData: (newData: Partial<AppState>) => void;
}

type SettingsTab = 'AREE_LINEE' | 'PRODOTTI' | 'TIPOLOGIE' | 'CALIBRI' | 'VARIETA' | 'ARTICOLI' | 'LOTTI' | 'IMBALLI';
type DeactivableKey = 'prodottiGrezzi' | 'tipologie' | 'calibri' | 'varieta' | 'articoli' | 'sigleLotto' | 'imballi' | 'aree' | 'linee';

const SettingsDashboard: React.FC<SettingsDashboardProps> = ({ data, onUpdateData }) => {
  const { showAlert, showConfirm } = useDialog();
  const [activeTab, setActiveTab] = useState<SettingsTab>('AREE_LINEE');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showInactive, setShowInactive] = useState(false);

  const [newProdotto, setNewProdotto] = useState<Partial<ProdottoGrezzo>>({ attivo: true });
  const [newTipologia, setNewTipologia] = useState<Partial<Tipologia>>({ ordinamento: 1, attivo: true });
  const [newCalibro, setNewCalibro] = useState<Partial<Calibro>>({ ordinamento: 1, attivo: true });
  const [newVarieta, setNewVarieta] = useState<Partial<Varieta>>({ attiva: true });
  const [newArticolo, setNewArticolo] = useState<Partial<Articolo>>({ tipoPeso: 'EGALIZZATO', pesoColloTeorico: 0, attivo: true });
  const [newLotto, setNewLotto] = useState<Partial<SiglaLotto>>({});
  const [newImballo, setNewImballo] = useState<Partial<Imballo>>({ taraKg: 0, attivo: true });
  const [newArea, setNewArea] = useState<Partial<Area>>({ attiva: true });
  const [newLinea, setNewLinea] = useState<Partial<Linea>>({ attiva: true });

  useEffect(() => {
    resetAllForms();
  }, [activeTab]);

  const resetAllForms = () => {
    setEditingId(null);
    setNewProdotto({ nome: '', codice: '', attivo: true });
    setNewTipologia({ nome: '', prodottoId: '', ordinamento: 1, attivo: true });
    setNewCalibro({ nome: '', prodottoId: '', ordinamento: 1, descrizione: '', attivo: true });
    setNewVarieta({ nome: '', codice: '', prodottoId: '', tipologiaId: '', attiva: true });
    setNewArticolo({ tipoPeso: 'EGALIZZATO', pesoColloTeorico: 0, codice: '', nome: '', prodottoId: '', varietaId: '', tipologiaId: '', attivo: true });
    setNewLotto({ code: '', produttore: '', varietaId: '', campo: '' });
    setNewImballo({ nome: '', codice: '', taraKg: 0, attivo: true });
    setNewArea({ nome: '', attiva: true });
    setNewLinea({ nome: '', areaId: data.aree[0]?.id || '', attiva: true });
  };

  const buildAuditFields = () => {
    const now = new Date().toISOString();
    return { createdAt: now, updatedAt: now };
  };

  const selectedProdForVar = useMemo(() => data.prodottiGrezzi.find((p) => p.id === newVarieta.prodottoId), [data.prodottiGrezzi, newVarieta.prodottoId]);
  const selectedProdForArt = useMemo(() => data.prodottiGrezzi.find((p) => p.id === newArticolo.prodottoId), [data.prodottiGrezzi, newArticolo.prodottoId]);


  const prodottiVisibili = showInactive ? data.prodottiGrezzi : data.prodottiGrezzi.filter((item) => item.attivo !== false);
  const tipologieVisibili = showInactive ? data.tipologie : data.tipologie.filter((item) => item.attivo !== false);
  const calibriVisibili = showInactive ? data.calibri : data.calibri.filter((item) => item.attivo !== false);
  const varietaVisibili = showInactive ? data.varieta : data.varieta.filter((item) => item.attiva !== false);
  const articoliVisibili = showInactive ? data.articoli : data.articoli.filter((item) => item.attivo !== false);
  const imballiVisibili = showInactive ? data.imballi : data.imballi.filter((item) => item.attivo !== false);
  const areeVisibili = showInactive ? data.aree : data.aree.filter((item) => item.attiva !== false);
  const lineeVisibili = showInactive ? data.linee : data.linee.filter((item) => item.attiva !== false);

  const startEditProdotto = (p: ProdottoGrezzo) => { setEditingId(p.id); setNewProdotto({ ...p }); };
  const startEditTipologia = (t: Tipologia) => { setEditingId(t.id); setNewTipologia({ ...t }); };
  const startEditCalibro = (c: Calibro) => { setEditingId(c.id); setNewCalibro({ ...c }); };
  const startEditVarieta = (v: Varieta) => { setEditingId(v.id); setNewVarieta({ ...v }); };
  const startEditArticolo = (a: Articolo) => { setEditingId(a.id); setNewArticolo({ ...a }); };
  const startEditLotto = (l: SiglaLotto) => { setEditingId(l.id); setNewLotto({ ...l }); };
  const startEditImballo = (i: Imballo) => { setEditingId(i.id); setNewImballo({ ...i }); };
  const startEditArea = (a: Area) => { setEditingId(a.id); setNewArea({ ...a }); };
  const startEditLinea = (l: Linea) => { setEditingId(l.id); setNewLinea({ ...l }); };

  const saveProdotto = () => {
    if (!newProdotto.nome || !newProdotto.codice) return;
    const now = new Date().toISOString();
    const prodottiGrezzi = editingId
      ? data.prodottiGrezzi.map((p) => (p.id === editingId ? { ...p, ...newProdotto, codice: newProdotto.codice?.toUpperCase(), updatedAt: now } as ProdottoGrezzo : p))
      : [...data.prodottiGrezzi, { id: crypto.randomUUID(), nome: newProdotto.nome, codice: newProdotto.codice.toUpperCase(), attivo: newProdotto.attivo !== false, ...buildAuditFields() }];
    onUpdateData({ prodottiGrezzi });
    resetAllForms();
  };

  const saveTipologia = () => {
    if (!newTipologia.nome || !newTipologia.prodottoId) return;
    const now = new Date().toISOString();
    const tipologie = editingId
      ? data.tipologie.map((t) => (t.id === editingId ? { ...t, ...newTipologia, updatedAt: now } as Tipologia : t))
      : [...data.tipologie, { id: crypto.randomUUID(), nome: newTipologia.nome, prodottoId: newTipologia.prodottoId, ordinamento: Number(newTipologia.ordinamento) || 1, attivo: newTipologia.attivo !== false, ...buildAuditFields() }];
    onUpdateData({ tipologie });
    resetAllForms();
  };

  const saveCalibro = () => {
    if (!newCalibro.nome || !newCalibro.prodottoId) return;
    const now = new Date().toISOString();
    const calibri = editingId
      ? data.calibri.map((c) => (c.id === editingId ? { ...c, ...newCalibro, updatedAt: now } as Calibro : c))
      : [...data.calibri, { id: crypto.randomUUID(), nome: newCalibro.nome, prodottoId: newCalibro.prodottoId, descrizione: newCalibro.descrizione || undefined, ordinamento: Number(newCalibro.ordinamento) || 1, attivo: newCalibro.attivo !== false, ...buildAuditFields() }];
    onUpdateData({ calibri });
    resetAllForms();
  };

  const saveVarieta = () => {
    if (!newVarieta.nome || !newVarieta.prodottoId || !newVarieta.codice) return;
    const now = new Date().toISOString();
    const varieta = editingId
      ? data.varieta.map((v) => (v.id === editingId ? { ...v, ...newVarieta, updatedAt: now } as Varieta : v))
      : [...data.varieta, { id: crypto.randomUUID(), codice: newVarieta.codice.toUpperCase(), nome: newVarieta.nome, prodottoId: newVarieta.prodottoId, tipologiaId: newVarieta.tipologiaId || undefined, attiva: newVarieta.attiva !== false, ...buildAuditFields() }];
    onUpdateData({ varieta });
    resetAllForms();
  };

  const saveArticolo = () => {
    if (!newArticolo.nome || !newArticolo.codice || !newArticolo.pesoColloTeorico) return;
    const now = new Date().toISOString();
    const clean = { ...newArticolo };
    if (!clean.prodottoId) {
      clean.prodottoId = undefined;
      clean.tipologiaId = undefined;
      clean.varietaId = undefined;
    }
    if (clean.tipologiaId) clean.varietaId = undefined;
    if (clean.varietaId) clean.tipologiaId = undefined;

    const articoli = editingId
      ? data.articoli.map((a) => (a.id === editingId ? { ...a, ...clean, codice: clean.codice?.toUpperCase(), updatedAt: now } as Articolo : a))
      : [...data.articoli, { id: crypto.randomUUID(), codice: clean.codice!.toUpperCase(), nome: clean.nome!, prodottoId: clean.prodottoId, tipologiaId: clean.tipologiaId, varietaId: clean.varietaId, pesoColloTeorico: Number(clean.pesoColloTeorico), tipoPeso: (clean.tipoPeso || 'EGALIZZATO') as 'EGALIZZATO' | 'USCENTE', attivo: clean.attivo !== false, ...buildAuditFields() }];

    onUpdateData({ articoli });
    resetAllForms();
  };

  const saveLotto = () => {
    if (!newLotto.code || !newLotto.produttore || !newLotto.varietaId) return;
    const now = new Date().toISOString();
    const sigleLotto = editingId
      ? data.sigleLotto.map((l) => (l.id === editingId ? { ...l, ...newLotto, updatedAt: now } as SiglaLotto : l))
      : [...data.sigleLotto, { id: crypto.randomUUID(), code: newLotto.code, produttore: newLotto.produttore, varietaId: newLotto.varietaId, campo: newLotto.campo || '', ...buildAuditFields() }];
    onUpdateData({ sigleLotto });
    resetAllForms();
  };

  const saveImballo = () => {
    if (!newImballo.nome || !newImballo.codice) return;
    const now = new Date().toISOString();
    const imballi = editingId
      ? data.imballi.map((i) => (i.id === editingId ? { ...i, ...newImballo, codice: newImballo.codice?.toUpperCase(), updatedAt: now } as Imballo : i))
      : [...data.imballi, { id: crypto.randomUUID(), codice: newImballo.codice.toUpperCase(), nome: newImballo.nome, taraKg: newImballo.taraKg, attivo: newImballo.attivo !== false, ...buildAuditFields() }];
    onUpdateData({ imballi });
    resetAllForms();
  };

  const saveArea = () => {
    if (!newArea.nome) return;
    const now = new Date().toISOString();
    const aree = editingId
      ? data.aree.map((a) => (a.id === editingId ? { ...a, ...newArea, updatedAt: now } as Area : a))
      : [...data.aree, { id: crypto.randomUUID(), nome: newArea.nome, attiva: newArea.attiva !== false, ...buildAuditFields() }];
    onUpdateData({ aree });
    resetAllForms();
  };

  const saveLinea = () => {
    if (!newLinea.nome || !newLinea.areaId) return;
    const now = new Date().toISOString();
    const linee = editingId
      ? data.linee.map((l) => (l.id === editingId ? { ...l, ...newLinea, updatedAt: now } as Linea : l))
      : [...data.linee, { id: crypto.randomUUID(), nome: newLinea.nome, areaId: newLinea.areaId, attiva: newLinea.attiva !== false, ...buildAuditFields() }];
    onUpdateData({ linee });
    resetAllForms();
  };

  const canDeactivate = (key: DeactivableKey, id: string): string | null => {
    if (key === 'prodottiGrezzi') {
      if (data.tipologie.some((t) => t.prodottoId === id && t.attivo)) return 'Prodotto usato da tipologie attive.';
      if (data.calibri.some((c) => c.prodottoId === id && c.attivo)) return 'Prodotto usato da calibri attivi.';
      if (data.varieta.some((v) => v.prodottoId === id && v.attiva !== false)) return 'Prodotto usato da varietà attive.';
    }
    if (key === 'tipologie') {
      if (data.varieta.some((v) => v.tipologiaId === id && v.attiva !== false)) return 'Tipologia usata da varietà attive.';
      if (data.articoli.some((a) => a.tipologiaId === id && a.attivo !== false)) return 'Tipologia usata da articoli attivi.';
    }
    if (key === 'calibri') {
      if (data.pedane.some((p) => p.calibroId === id)) return 'Calibro già usato in pedane.';
    }
    if (key === 'varieta') {
      if (data.sigleLotto.some((l) => l.varietaId === id)) return 'Varietà usata da sigle lotto.';
    }
    if (key === 'articoli') {
      if (data.lavorazioni.some((l) => l.articoloId === id)) return 'Articolo usato da lavorazioni.';
    }
    return null;
  };

  const deactivateItem = async (key: DeactivableKey, id: string) => {
    const blockReason = canDeactivate(key, id);
    if (blockReason) {
      showAlert({ title: 'Impossibile disattivare', message: blockReason, variant: 'DANGER' });
      return;
    }

    const confirmed = await showConfirm({
      title: 'Disattiva elemento',
      message: 'L\'elemento resterà nello storico ma non sarà più selezionabile.',
      variant: 'DANGER',
      confirmText: 'Disattiva',
      cancelText: 'Annulla'
    });
    if (!confirmed) return;

    const now = new Date().toISOString();
    const updater = (item: any) => {
      if (item.id !== id) return item;
      if ('attivo' in item) return { ...item, attivo: false, updatedAt: now };
      if ('attiva' in item) return { ...item, attiva: false, updatedAt: now };
      return item;
    };

    onUpdateData({ [key]: (data[key] as any[]).map(updater) } as Partial<AppState>);
    if (editingId === id) resetAllForms();
  };

  const ActionButtons = ({ onSave }: { onSave: () => void }) => (
    <div className="flex gap-2 w-full mt-4">
      {editingId && <button onClick={resetAllForms} className="px-4 py-2 bg-gray-200 text-gray-700 rounded text-sm font-bold hover:bg-gray-300 flex items-center gap-2"><RotateCcw size={16} /> Annulla</button>}
      <button onClick={onSave} className={`flex-1 ${editingId ? 'bg-orange-500 hover:bg-orange-600' : 'bg-agri-600 hover:bg-agri-700'} text-white rounded p-2 text-sm font-bold flex items-center justify-center gap-2`}>
        {editingId ? <Pencil size={16} /> : <Plus size={16} />} {editingId ? 'Aggiorna Modifiche' : 'Aggiungi Nuovo'}
      </button>
    </div>
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden min-h-[600px] flex">
      <div className="w-64 bg-gray-50 border-r border-gray-200 p-4 space-y-2">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 px-2">Anagrafiche</h3>
        <button onClick={() => setActiveTab('AREE_LINEE')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium ${activeTab === 'AREE_LINEE' ? 'bg-agri-100 text-agri-800' : 'text-gray-600 hover:bg-gray-100'}`}><Factory size={18} />Aree e Linee</button>
        <button onClick={() => setActiveTab('PRODOTTI')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium ${activeTab === 'PRODOTTI' ? 'bg-agri-100 text-agri-800' : 'text-gray-600 hover:bg-gray-100'}`}><Apple size={18} />Prodotti</button>
        <button onClick={() => setActiveTab('TIPOLOGIE')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium ${activeTab === 'TIPOLOGIE' ? 'bg-agri-100 text-agri-800' : 'text-gray-600 hover:bg-gray-100'}`}><Layers size={18} />Tipologie</button>
        <button onClick={() => setActiveTab('CALIBRI')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium ${activeTab === 'CALIBRI' ? 'bg-agri-100 text-agri-800' : 'text-gray-600 hover:bg-gray-100'}`}><Ruler size={18} />Calibri</button>
        <button onClick={() => setActiveTab('VARIETA')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium ${activeTab === 'VARIETA' ? 'bg-agri-100 text-agri-800' : 'text-gray-600 hover:bg-gray-100'}`}><Sprout size={18} />Varietà</button>
        <button onClick={() => setActiveTab('ARTICOLI')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium ${activeTab === 'ARTICOLI' ? 'bg-agri-100 text-agri-800' : 'text-gray-600 hover:bg-gray-100'}`}><Package size={18} />Articoli</button>
        <button onClick={() => setActiveTab('LOTTI')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium ${activeTab === 'LOTTI' ? 'bg-agri-100 text-agri-800' : 'text-gray-600 hover:bg-gray-100'}`}><Tags size={18} />Sigle Lotto</button>
        <button onClick={() => setActiveTab('IMBALLI')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium ${activeTab === 'IMBALLI' ? 'bg-agri-100 text-agri-800' : 'text-gray-600 hover:bg-gray-100'}`}><Box size={18} />Imballaggi</button>
      </div>

      <div className="flex-1 p-8 overflow-y-auto space-y-4">
        <label className="inline-flex items-center gap-2 text-sm text-gray-600"><input type="checkbox" checked={showInactive} onChange={(e) => setShowInactive(e.target.checked)} />Mostra disattivati</label>

        {activeTab === 'PRODOTTI' && (
          <>
            <h2 className="text-2xl font-bold">Prodotti Grezzi</h2>
            <div className="grid grid-cols-3 gap-3 p-4 bg-gray-50 border rounded">
              <input className="border rounded p-2" placeholder="Codice" value={newProdotto.codice || ''} onChange={(e) => setNewProdotto({ ...newProdotto, codice: e.target.value })} />
              <input className="border rounded p-2" placeholder="Nome" value={newProdotto.nome || ''} onChange={(e) => setNewProdotto({ ...newProdotto, nome: e.target.value })} />
              <label className="inline-flex items-center gap-2 text-sm"><input type="checkbox" checked={newProdotto.attivo !== false} onChange={(e) => setNewProdotto({ ...newProdotto, attivo: e.target.checked })} />Attivo</label>
              <div className="col-span-3"><ActionButtons onSave={saveProdotto} /></div>
            </div>
            <ul className="divide-y border rounded bg-white">{prodottiVisibili.map((p) => <li key={p.id} className="p-3 flex justify-between"><span>{p.codice} - {p.nome} {p.attivo === false && '(disattivato)'}</span><span className="flex gap-2"><button onClick={() => startEditProdotto(p)}><Pencil size={16} /></button><button onClick={() => deactivateItem('prodottiGrezzi', p.id)} title="Disattiva"><RotateCcw size={16} /></button></span></li>)}</ul>
          </>
        )}

        {activeTab === 'TIPOLOGIE' && (
          <>
            <h2 className="text-2xl font-bold">Tipologie</h2>
            <div className="grid grid-cols-4 gap-3 p-4 bg-gray-50 border rounded">
              <select className="border rounded p-2" value={newTipologia.prodottoId || ''} onChange={(e) => setNewTipologia({ ...newTipologia, prodottoId: e.target.value })}><option value="">Prodotto</option>{data.prodottiGrezzi.filter((p) => p.attivo !== false).map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}</select>
              <input className="border rounded p-2" placeholder="Nome" value={newTipologia.nome || ''} onChange={(e) => setNewTipologia({ ...newTipologia, nome: e.target.value })} />
              <input className="border rounded p-2" type="number" placeholder="Ordinamento" value={newTipologia.ordinamento || 1} onChange={(e) => setNewTipologia({ ...newTipologia, ordinamento: Number(e.target.value) })} />
              <label className="inline-flex items-center gap-2 text-sm"><input type="checkbox" checked={newTipologia.attivo !== false} onChange={(e) => setNewTipologia({ ...newTipologia, attivo: e.target.checked })} />Attiva</label>
              <div className="col-span-4"><ActionButtons onSave={saveTipologia} /></div>
            </div>
            <ul className="divide-y border rounded bg-white">{tipologieVisibili.map((t) => <li key={t.id} className="p-3 flex justify-between"><span>{t.nome} - {data.prodottiGrezzi.find((p) => p.id === t.prodottoId)?.nome || 'N/D'} {t.attivo === false && '(disattivata)'}</span><span className="flex gap-2"><button onClick={() => startEditTipologia(t)}><Pencil size={16} /></button><button onClick={() => deactivateItem('tipologie', t.id)} title="Disattiva"><RotateCcw size={16} /></button></span></li>)}</ul>
          </>
        )}

        {activeTab === 'CALIBRI' && (
          <>
            <h2 className="text-2xl font-bold">Calibri</h2>
            <div className="grid grid-cols-5 gap-3 p-4 bg-gray-50 border rounded">
              <select className="border rounded p-2" value={newCalibro.prodottoId || ''} onChange={(e) => setNewCalibro({ ...newCalibro, prodottoId: e.target.value })}><option value="">Prodotto</option>{data.prodottiGrezzi.filter((p) => p.attivo !== false).map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}</select>
              <input className="border rounded p-2" placeholder="Nome" value={newCalibro.nome || ''} onChange={(e) => setNewCalibro({ ...newCalibro, nome: e.target.value })} />
              <input className="border rounded p-2" type="number" placeholder="Ordinamento" value={newCalibro.ordinamento || 1} onChange={(e) => setNewCalibro({ ...newCalibro, ordinamento: Number(e.target.value) })} />
              <input className="border rounded p-2" placeholder="Descrizione" value={newCalibro.descrizione || ''} onChange={(e) => setNewCalibro({ ...newCalibro, descrizione: e.target.value })} />
              <label className="inline-flex items-center gap-2 text-sm"><input type="checkbox" checked={newCalibro.attivo !== false} onChange={(e) => setNewCalibro({ ...newCalibro, attivo: e.target.checked })} />Attivo</label>
              <div className="col-span-5"><ActionButtons onSave={saveCalibro} /></div>
            </div>
            <ul className="divide-y border rounded bg-white">{calibriVisibili.map((c) => <li key={c.id} className="p-3 flex justify-between"><span>{c.nome} - {data.prodottiGrezzi.find((p) => p.id === c.prodottoId)?.nome || 'N/D'} {c.attivo === false && '(disattivato)'}</span><span className="flex gap-2"><button onClick={() => startEditCalibro(c)}><Pencil size={16} /></button><button onClick={() => deactivateItem('calibri', c.id)} title="Disattiva"><RotateCcw size={16} /></button></span></li>)}</ul>
          </>
        )}

        {activeTab === 'VARIETA' && (
          <>
            <h2 className="text-2xl font-bold">Varietà</h2>
            <div className="grid grid-cols-4 gap-3 p-4 bg-gray-50 border rounded">
              <select className="border rounded p-2" value={newVarieta.prodottoId || ''} onChange={(e) => setNewVarieta({ ...newVarieta, prodottoId: e.target.value, tipologiaId: '' })}><option value="">Prodotto</option>{data.prodottiGrezzi.filter((p) => p.attivo !== false).map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}</select>
              <input className="border rounded p-2" placeholder="Codice" value={newVarieta.codice || ''} onChange={(e) => setNewVarieta({ ...newVarieta, codice: e.target.value })} />
              <input className="border rounded p-2" placeholder="Nome" value={newVarieta.nome || ''} onChange={(e) => setNewVarieta({ ...newVarieta, nome: e.target.value })} />
              <select className="border rounded p-2" value={newVarieta.tipologiaId || ''} onChange={(e) => setNewVarieta({ ...newVarieta, tipologiaId: e.target.value })}><option value="">Tipologia (opzionale)</option>{data.tipologie.filter((t) => t.prodottoId === selectedProdForVar?.id && t.attivo).map((t) => <option key={t.id} value={t.id}>{t.nome}</option>)}</select>
              <div className="col-span-4"><ActionButtons onSave={saveVarieta} /></div>
            </div>
            <ul className="divide-y border rounded bg-white">{varietaVisibili.map((v) => <li key={v.id} className="p-3 flex justify-between"><span>{v.codice} - {v.nome}</span><span className="flex gap-2"><button onClick={() => startEditVarieta(v)}><Pencil size={16} /></button><button onClick={() => deactivateItem('varieta', v.id)}><RotateCcw size={16} /></button></span></li>)}</ul>
          </>
        )}

        {activeTab === 'ARTICOLI' && (
          <>
            <h2 className="text-2xl font-bold">Articoli</h2>
            <div className="grid grid-cols-4 gap-3 p-4 bg-gray-50 border rounded">
              <input className="border rounded p-2" placeholder="Codice" value={newArticolo.codice || ''} onChange={(e) => setNewArticolo({ ...newArticolo, codice: e.target.value })} />
              <input className="border rounded p-2" placeholder="Nome" value={newArticolo.nome || ''} onChange={(e) => setNewArticolo({ ...newArticolo, nome: e.target.value })} />
              <select className="border rounded p-2" value={newArticolo.prodottoId || ''} onChange={(e) => setNewArticolo({ ...newArticolo, prodottoId: e.target.value, tipologiaId: '', varietaId: '' })}><option value="">Prodotto generico</option>{data.prodottiGrezzi.filter((p) => p.attivo !== false).map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}</select>
              <input className="border rounded p-2" type="number" placeholder="Peso" value={newArticolo.pesoColloTeorico || ''} onChange={(e) => setNewArticolo({ ...newArticolo, pesoColloTeorico: Number(e.target.value) })} />
              <select className="border rounded p-2" value={newArticolo.tipologiaId || ''} onChange={(e) => setNewArticolo({ ...newArticolo, tipologiaId: e.target.value, varietaId: '' })} disabled={!newArticolo.prodottoId || !!newArticolo.varietaId}><option value="">Tipologia (opzionale)</option>{data.tipologie.filter((t) => t.prodottoId === selectedProdForArt?.id && t.attivo).map((t) => <option key={t.id} value={t.id}>{t.nome}</option>)}</select>
              <select className="border rounded p-2" value={newArticolo.varietaId || ''} onChange={(e) => setNewArticolo({ ...newArticolo, varietaId: e.target.value, tipologiaId: '' })} disabled={!newArticolo.prodottoId || !!newArticolo.tipologiaId}><option value="">Varietà (opzionale)</option>{data.varieta.filter((v) => v.prodottoId === selectedProdForArt?.id && v.attiva !== false).map((v) => <option key={v.id} value={v.id}>{v.nome}</option>)}</select>
              <select className="border rounded p-2" value={newArticolo.tipoPeso || 'EGALIZZATO'} onChange={(e) => setNewArticolo({ ...newArticolo, tipoPeso: e.target.value as 'EGALIZZATO' | 'USCENTE' })}><option value="EGALIZZATO">EGALIZZATO</option><option value="USCENTE">USCENTE</option></select>
              <label className="inline-flex items-center gap-2 text-sm"><input type="checkbox" checked={newArticolo.attivo !== false} onChange={(e) => setNewArticolo({ ...newArticolo, attivo: e.target.checked })} />Attivo</label>
              <div className="col-span-4"><ActionButtons onSave={saveArticolo} /></div>
            </div>
            <ul className="divide-y border rounded bg-white">{articoliVisibili.map((a) => <li key={a.id} className="p-3 flex justify-between"><span>{a.codice} - {a.nome}</span><span className="flex gap-2"><button onClick={() => startEditArticolo(a)}><Pencil size={16} /></button><button onClick={() => deactivateItem('articoli', a.id)}><RotateCcw size={16} /></button></span></li>)}</ul>
          </>
        )}

        {activeTab === 'LOTTI' && (
          <>
            <h2 className="text-2xl font-bold">Sigle Lotto</h2>
            <div className="grid grid-cols-4 gap-3 p-4 bg-gray-50 border rounded">
              <input className="border rounded p-2" placeholder="Sigla" value={newLotto.code || ''} onChange={(e) => setNewLotto({ ...newLotto, code: e.target.value })} />
              <input className="border rounded p-2" placeholder="Produttore" value={newLotto.produttore || ''} onChange={(e) => setNewLotto({ ...newLotto, produttore: e.target.value })} />
              <select className="border rounded p-2" value={newLotto.varietaId || ''} onChange={(e) => setNewLotto({ ...newLotto, varietaId: e.target.value })}><option value="">Varietà</option>{data.varieta.filter((v) => v.attiva !== false).map((v) => <option key={v.id} value={v.id}>{v.nome}</option>)}</select>
              <input className="border rounded p-2" placeholder="Campo" value={newLotto.campo || ''} onChange={(e) => setNewLotto({ ...newLotto, campo: e.target.value })} />
              <div className="col-span-4"><ActionButtons onSave={saveLotto} /></div>
            </div>
            <ul className="divide-y border rounded bg-white">{data.sigleLotto.map((l) => <li key={l.id} className="p-3 flex justify-between"><span>{l.code} - {l.produttore}</span><span className="flex gap-2"><button onClick={() => startEditLotto(l)}><Pencil size={16} /></button></span></li>)}</ul>
          </>
        )}

        {activeTab === 'IMBALLI' && (
          <>
            <h2 className="text-2xl font-bold">Imballi</h2>
            <div className="grid grid-cols-4 gap-3 p-4 bg-gray-50 border rounded">
              <input className="border rounded p-2" placeholder="Codice" value={newImballo.codice || ''} onChange={(e) => setNewImballo({ ...newImballo, codice: e.target.value })} />
              <input className="border rounded p-2" placeholder="Nome" value={newImballo.nome || ''} onChange={(e) => setNewImballo({ ...newImballo, nome: e.target.value })} />
              <input className="border rounded p-2" type="number" placeholder="Tara" value={newImballo.taraKg || 0} onChange={(e) => setNewImballo({ ...newImballo, taraKg: Number(e.target.value) })} />
              <label className="inline-flex items-center gap-2 text-sm"><input type="checkbox" checked={newImballo.attivo !== false} onChange={(e) => setNewImballo({ ...newImballo, attivo: e.target.checked })} />Attivo</label>
              <div className="col-span-4"><ActionButtons onSave={saveImballo} /></div>
            </div>
            <ul className="divide-y border rounded bg-white">{imballiVisibili.map((i) => <li key={i.id} className="p-3 flex justify-between"><span>{i.codice} - {i.nome}</span><span className="flex gap-2"><button onClick={() => startEditImballo(i)}><Pencil size={16} /></button><button onClick={() => deactivateItem('imballi', i.id)}><RotateCcw size={16} /></button></span></li>)}</ul>
          </>
        )}

        {activeTab === 'AREE_LINEE' && (
          <>
            <h2 className="text-2xl font-bold">Aree e Linee</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-4 rounded-lg border bg-gray-50 space-y-3">
                <h3 className="font-bold">Area</h3>
                <input type="text" className="w-full border rounded p-2 text-sm" placeholder="Nome area" value={newArea.nome || ''} onChange={(e) => setNewArea({ ...newArea, nome: e.target.value })} />
                <button onClick={saveArea} className="w-full bg-agri-600 text-white rounded p-2 text-sm font-bold">Salva Area</button>
                <ul className="divide-y border rounded bg-white">{areeVisibili.map((a) => <li key={a.id} className="px-3 py-2 flex justify-between text-sm"><span>{a.nome}</span><span className="flex gap-2"><button onClick={() => startEditArea(a)}><Pencil size={14} /></button><button onClick={() => deactivateItem('aree', a.id)}><RotateCcw size={14} /></button></span></li>)}</ul>
              </div>
              <div className="p-4 rounded-lg border bg-gray-50 space-y-3">
                <h3 className="font-bold">Linea</h3>
                <input type="text" className="w-full border rounded p-2 text-sm" placeholder="Nome linea" value={newLinea.nome || ''} onChange={(e) => setNewLinea({ ...newLinea, nome: e.target.value })} />
                <select className="w-full border rounded p-2 text-sm" value={newLinea.areaId || ''} onChange={(e) => setNewLinea({ ...newLinea, areaId: e.target.value })}>{data.aree.filter((a) => a.attiva).map((a) => <option key={a.id} value={a.id}>{a.nome}</option>)}</select>
                <button onClick={saveLinea} className="w-full bg-agri-600 text-white rounded p-2 text-sm font-bold">Salva Linea</button>
                <ul className="divide-y border rounded bg-white">{lineeVisibili.map((l) => <li key={l.id} className="px-3 py-2 flex justify-between text-sm"><span>{l.nome}</span><span className="flex gap-2"><button onClick={() => startEditLinea(l)}><Pencil size={14} /></button><button onClick={() => deactivateItem('linee', l.id)}><RotateCcw size={14} /></button></span></li>)}</ul>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SettingsDashboard;
