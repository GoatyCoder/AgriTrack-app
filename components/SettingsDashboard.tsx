import React, { useState, useEffect } from 'react';
import { Trash2, Package, Tags, Box, Sprout, Apple, Plus, Pencil, RotateCcw, Factory } from 'lucide-react';
import { AppState, Articolo, SiglaLotto, ProdottoGrezzo, Varieta, Imballo, Area, Linea, Tipologia, Calibro } from '../types';
import { useDialog } from './DialogContext';

interface SettingsDashboardProps {
  data: AppState;
  onUpdateData: (newData: Partial<AppState>) => void;
}

const SettingsDashboard: React.FC<SettingsDashboardProps> = ({ data, onUpdateData }) => {
  const { showConfirm, showAlert } = useDialog();
  const [activeTab, setActiveTab] = useState<'AREE_LINEE' | 'PRODOTTI' | 'VARIETA' | 'ARTICOLI' | 'LOTTI' | 'IMBALLI'>('AREE_LINEE');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [mostraDisattivati, setMostraDisattivati] = useState(false);

  // Forms State
  const [newProdotto, setNewProdotto] = useState<Partial<ProdottoGrezzo>>({ attivo: true });

  const [newVarieta, setNewVarieta] = useState<Partial<Varieta>>({});
  const [draftTipologie, setDraftTipologie] = useState<Array<{ id?: string; nome: string }>>([]);
  const [draftCalibri, setDraftCalibri] = useState<Array<{ id?: string; nome: string; ordinamento: number }>>([]);
  const [nuovaTipologiaNome, setNuovaTipologiaNome] = useState('');
  const [nuovoCalibroNome, setNuovoCalibroNome] = useState('');
  const [nuovoCalibroOrd, setNuovoCalibroOrd] = useState(1);
  const [newArticolo, setNewArticolo] = useState<Partial<Articolo>>({ tipoPeso: 'EGALIZZATO', pesoColloTeorico: 0 });
  const [newLotto, setNewLotto] = useState<Partial<SiglaLotto>>({});
  const [newImballo, setNewImballo] = useState<Partial<Imballo>>({});
  const [newArea, setNewArea] = useState<Partial<Area>>({ attiva: true });
  const [newLinea, setNewLinea] = useState<Partial<Linea>>({ attiva: true });

  // Reset forms when tab changes
  useEffect(() => {
    resetAllForms();
  }, [activeTab]);

  const resetAllForms = () => {
    setEditingId(null);
    setNewProdotto({ nome: '', codice: '', attivo: true });
    setNewVarieta({ nome: '', codice: '', prodottoId: '', tipologiaId: '' });
    setDraftTipologie([]);
    setDraftCalibri([]);
    setNuovaTipologiaNome('');
    setNuovoCalibroNome('');
    setNuovoCalibroOrd(1);
    setNewArticolo({ tipoPeso: 'EGALIZZATO', pesoColloTeorico: 0, codice: '', nome: '', prodottoId: '', varietaId: '', tipologiaId: '' });
    setNewLotto({ code: '', produttore: '', varietaId: '', campo: '' });
    setNewImballo({ nome: '', codice: '', taraKg: 0 });
    setNewArea({ nome: '', attiva: true });
    setNewLinea({ nome: '', areaId: data.aree[0]?.id || '', attiva: true });
  };

  // --- Start Edit Handlers ---
  
  const startEditProdotto = (p: ProdottoGrezzo) => {
    setEditingId(p.id);
    setNewProdotto({ ...p });
    const tipologieProdotto = data.tipologie
      .filter((tipologia) => tipologia.prodottoId === p.id && tipologia.attivo)
      .map((tipologia) => ({ id: tipologia.id, nome: tipologia.nome }));
    const calibriProdotto = data.calibri
      .filter((calibro) => calibro.prodottoId === p.id && calibro.attivo)
      .sort((a, b) => a.ordinamento - b.ordinamento)
      .map((calibro) => ({ id: calibro.id, nome: calibro.nome, ordinamento: calibro.ordinamento }));
    setDraftTipologie(tipologieProdotto);
    setDraftCalibri(calibriProdotto);
    document.querySelector('.overflow-y-auto')?.scrollTo(0,0);
  };

  const startEditVarieta = (v: Varieta) => {
    setEditingId(v.id);
    setNewVarieta({ ...v });
    document.querySelector('.overflow-y-auto')?.scrollTo(0,0);
  };


  const startEditArticolo = (a: Articolo) => {
    setEditingId(a.id);
    setNewArticolo({ ...a });
    document.querySelector('.overflow-y-auto')?.scrollTo(0,0);
  };

  const startEditLotto = (l: SiglaLotto) => {
    setEditingId(l.id);
    setNewLotto({ ...l });
    document.querySelector('.overflow-y-auto')?.scrollTo(0,0);
  };

  const startEditImballo = (i: Imballo) => {
    setEditingId(i.id);
    setNewImballo({ ...i });
  };



  const buildAuditFields = () => {
    const now = new Date().toISOString();
    return {
      createdAt: now,
      updatedAt: now
    };
  };

  // --- Save Handlers ---

  const addTipologiaDraft = () => {
    const nome = nuovaTipologiaNome.trim();
    if (!nome) return;
    if (draftTipologie.some((tipologia) => tipologia.nome.toLowerCase() === nome.toLowerCase())) return;
    setDraftTipologie((prev) => [...prev, { nome }]);
    setNuovaTipologiaNome('');
  };

  const removeTipologiaDraft = (nome: string) => {
    setDraftTipologie((prev) => prev.filter((tipologia) => tipologia.nome !== nome));
  };

  const addCalibroDraft = () => {
    const nome = nuovoCalibroNome.trim();
    if (!nome) return;
    if (draftCalibri.some((calibro) => calibro.nome.toLowerCase() === nome.toLowerCase())) return;
    setDraftCalibri((prev) => [...prev, { nome, ordinamento: nuovoCalibroOrd || 1 }].sort((a, b) => a.ordinamento - b.ordinamento));
    setNuovoCalibroNome('');
    setNuovoCalibroOrd(1);
  };

  const removeCalibroDraft = (nome: string) => {
    setDraftCalibri((prev) => prev.filter((calibro) => calibro.nome !== nome));
  };

  const saveProdotto = () => {
    if (!newProdotto.nome || !newProdotto.codice) return;
    const now = new Date().toISOString();
    const prodottoId = editingId || crypto.randomUUID();

    let updatedProdotti = [...data.prodottiGrezzi];
    if (editingId) {
      updatedProdotti = updatedProdotti.map((prodotto) => prodotto.id === editingId ? { ...prodotto, ...newProdotto, updatedAt: now } as ProdottoGrezzo : prodotto);
    } else {
      updatedProdotti.push({
        id: prodottoId,
        codice: newProdotto.codice.toUpperCase(),
        nome: newProdotto.nome,
        attivo: newProdotto.attivo !== false,
        ...buildAuditFields()
      });
    }

    const existingTipologie = data.tipologie.filter((tipologia) => tipologia.prodottoId === prodottoId);
    const preservedTipologie = data.tipologie.filter((tipologia) => tipologia.prodottoId !== prodottoId);
    const nextTipologie = draftTipologie.map((tipologiaDraft) => {
      const existing = existingTipologie.find((tipologia) => tipologia.id === tipologiaDraft.id || tipologia.nome === tipologiaDraft.nome);
      return {
        id: existing?.id || crypto.randomUUID(),
        nome: tipologiaDraft.nome,
        prodottoId,
        ordinamento: existing?.ordinamento || 1,
        attivo: true,
        createdAt: existing?.createdAt || now,
        updatedAt: now,
        createdBy: existing?.createdBy,
        updatedBy: existing?.updatedBy
      } as Tipologia;
    });
    const removedTipologie = existingTipologie
      .filter((tipologia) => !nextTipologie.some((nextTipologia) => nextTipologia.id === tipologia.id))
      .map((tipologia) => ({ ...tipologia, attivo: false, updatedAt: now }));

    const existingCalibri = data.calibri.filter((calibro) => calibro.prodottoId === prodottoId);
    const preservedCalibri = data.calibri.filter((calibro) => calibro.prodottoId !== prodottoId);
    const nextCalibri = draftCalibri.map((calibroDraft) => {
      const existing = existingCalibri.find((calibro) => calibro.id === calibroDraft.id || calibro.nome === calibroDraft.nome);
      return {
        id: existing?.id || crypto.randomUUID(),
        nome: calibroDraft.nome,
        prodottoId,
        ordinamento: calibroDraft.ordinamento,
        descrizione: existing?.descrizione,
        attivo: true,
        createdAt: existing?.createdAt || now,
        updatedAt: now,
        createdBy: existing?.createdBy,
        updatedBy: existing?.updatedBy
      } as Calibro;
    });
    const removedCalibri = existingCalibri
      .filter((calibro) => !nextCalibri.some((nextCalibro) => nextCalibro.id === calibro.id))
      .map((calibro) => ({ ...calibro, attivo: false, updatedAt: now }));

    onUpdateData({
      prodottiGrezzi: updatedProdotti,
      tipologie: [...preservedTipologie, ...nextTipologie, ...removedTipologie],
      calibri: [...preservedCalibri, ...nextCalibri, ...removedCalibri]
    });
    resetAllForms();
  };

  const saveVarieta = () => {
    const now = new Date().toISOString();
    if (!newVarieta.nome || !newVarieta.prodottoId || !newVarieta.codice) return;
    
    let updatedList = [...data.varieta];

    if (editingId) {
        updatedList = updatedList.map(v => v.id === editingId ? { ...v, ...newVarieta, updatedAt: now } as Varieta : v);
    } else {
        const item: Varieta = { 
            id: crypto.randomUUID(), 
            codice: newVarieta.codice.toUpperCase(),
            nome: newVarieta.nome, 
            prodottoId: newVarieta.prodottoId,
            tipologiaId: newVarieta.tipologiaId,
            ...buildAuditFields()
        };
        updatedList.push(item);
    }

    onUpdateData({ varieta: updatedList });
    resetAllForms();
  };

  const saveArticolo = () => {
    const now = new Date().toISOString();
    // Check required fields (prodottoId is now optional)
    if (!newArticolo.nome || !newArticolo.pesoColloTeorico || !newArticolo.codice) return;
    
    const cleanArticolo = { ...newArticolo };
    
    // If no product is selected, ensure product-dependent fields are undefined
    if (!cleanArticolo.prodottoId) {
      cleanArticolo.prodottoId = undefined;
      cleanArticolo.varietaId = undefined;
      cleanArticolo.tipologiaId = undefined;
    } else {
      // If product exists, check dependencies
      if (cleanArticolo.varietaId) cleanArticolo.tipologiaId = undefined;
      if (cleanArticolo.tipologiaId) cleanArticolo.varietaId = undefined;
    }

    let updatedList = [...data.articoli];

    if (editingId) {
        updatedList = updatedList.map(a => a.id === editingId ? {
             ...a,
             updatedAt: now, 
             ...cleanArticolo,
             prodottoId: cleanArticolo.prodottoId || undefined,
             tipologiaId: cleanArticolo.tipologiaId || undefined, 
             varietaId: cleanArticolo.varietaId || undefined
        } as Articolo : a);
    } else {
        const item: Articolo = {
            id: crypto.randomUUID(),
            codice: cleanArticolo.codice.toUpperCase(),
            nome: cleanArticolo.nome!,
            prodottoId: cleanArticolo.prodottoId || undefined,
            varietaId: cleanArticolo.varietaId || undefined,
            tipologiaId: cleanArticolo.tipologiaId || undefined,
            pesoColloTeorico: Number(cleanArticolo.pesoColloTeorico),
            tipoPeso: cleanArticolo.tipoPeso as 'EGALIZZATO' | 'USCENTE',
            ...buildAuditFields()
        };
        updatedList.push(item);
    }

    onUpdateData({ articoli: updatedList });
    resetAllForms();
  };

  const saveLotto = () => {
    const now = new Date().toISOString();
    if (!newLotto.code || !newLotto.produttore || !newLotto.varietaId) return;
    if (!/^\d{4,5}$/.test(newLotto.code)) {
      showAlert({
        title: 'Sigla lotto non valida',
        message: 'La sigla lotto deve contenere solo 4 o 5 cifre numeriche.',
        variant: 'DANGER'
      });
      return;
    }
    
    let updatedList = [...data.sigleLotto];

    if (editingId) {
         updatedList = updatedList.map(l => l.id === editingId ? { ...l, ...newLotto, updatedAt: now } as SiglaLotto : l);
    } else {
        const item: SiglaLotto = {
            id: crypto.randomUUID(),
            code: newLotto.code,
            produttore: newLotto.produttore,
            varietaId: newLotto.varietaId,
            campo: newLotto.campo || '',
            ...buildAuditFields()
        };
        updatedList.push(item);
    }
    
    onUpdateData({ sigleLotto: updatedList });
    resetAllForms();
  };

  const saveImballo = () => {
    const now = new Date().toISOString();
    if (!newImballo.nome || !newImballo.codice) return;

    let updatedList = [...data.imballi];

    if (editingId) {
        updatedList = updatedList.map(i => i.id === editingId ? { ...i, ...newImballo, updatedAt: now } as Imballo : i);
    } else {
        const item: Imballo = {
            id: crypto.randomUUID(),
            codice: newImballo.codice.toUpperCase(),
            nome: newImballo.nome,
            ...buildAuditFields()
        };
        updatedList.push(item);
    }

    onUpdateData({ imballi: updatedList });
    resetAllForms();
  };


  const startEditArea = (a: Area) => {
    setEditingId(a.id);
    setNewArea({ ...a });
  };

  const startEditLinea = (l: Linea) => {
    setEditingId(l.id);
    setNewLinea({ ...l });
  };

  const saveArea = () => {
    const now = new Date().toISOString();
    if (!newArea.nome) return;
    let updatedList = [...data.aree];
    if (editingId) {
      updatedList = updatedList.map(a => a.id === editingId ? { ...a, ...newArea, updatedAt: now } as Area : a);
    } else {
      updatedList.push({ id: crypto.randomUUID(), nome: newArea.nome, attiva: newArea.attiva !== false, ...buildAuditFields() });
    }
    onUpdateData({ aree: updatedList });
    resetAllForms();
  };

  const saveLinea = () => {
    const now = new Date().toISOString();
    if (!newLinea.nome || !newLinea.areaId) return;
    let updatedList = [...data.linee];
    if (editingId) {
      updatedList = updatedList.map(l => l.id === editingId ? { ...l, ...newLinea, updatedAt: now } as Linea : l);
    } else {
      updatedList.push({ id: crypto.randomUUID(), nome: newLinea.nome, areaId: newLinea.areaId, attiva: newLinea.attiva !== false, ...buildAuditFields() });
    }
    onUpdateData({ linee: updatedList });
    resetAllForms();
  };

  const deleteItem = async (key: keyof AppState, id: string) => {
    const inUseMessages: Partial<Record<keyof AppState, string>> = {
      prodottiGrezzi: data.tipologie.some((tipologia) => tipologia.prodottoId === id && tipologia.attivo)
        || data.calibri.some((calibro) => calibro.prodottoId === id && calibro.attivo)
        || data.varieta.some((varieta) => varieta.prodottoId === id && varieta.attiva !== false)
        ? 'Prodotto in uso da tipologie, calibri o varietà attive.'
        : '',
      tipologie: data.varieta.some((varieta) => varieta.tipologiaId === id && varieta.attiva !== false)
        || data.articoli.some((articolo) => articolo.tipologiaId === id && articolo.attivo !== false)
        ? 'Tipologia in uso da varietà o articoli attivi.'
        : '',
      calibri: data.pedane.some((pedana) => pedana.calibroId === id)
        ? 'Calibro in uso da almeno una pedana.'
        : '',
      varieta: data.sigleLotto.some((lotto) => lotto.varietaId === id)
        ? 'Varietà in uso da almeno una sigla lotto.'
        : '',
      articoli: data.lavorazioni.some((lavorazione) => lavorazione.articoloId === id)
        ? 'Articolo in uso da almeno una lavorazione.'
        : '',
      aree: data.sessioniProduzione.some((sessioneProduzione) => sessioneProduzione.areaId === id && sessioneProduzione.status !== 'CHIUSO')
        ? 'Area in uso da sessioni produzione aperte.'
        : '',
      linee: data.lavorazioni.some((lavorazione) => lavorazione.lineaId === id && lavorazione.status !== 'CHIUSA')
        ? 'Linea in uso da lavorazioni attive o in pausa.'
        : '',
      imballi: data.pedane.some((pedana) => pedana.imballoId === id)
        ? 'Imballo in uso da almeno una pedana.'
        : ''
    };

    const inUseMessage = inUseMessages[key];
    if (inUseMessage) {
      await showAlert({
        title: 'Impossibile disattivare',
        message: inUseMessage,
        variant: 'DANGER'
      });
      return;
    }

    const canSoftDelete = ['aree', 'linee', 'prodottiGrezzi', 'tipologie', 'calibri', 'varieta', 'articoli', 'imballi'].includes(key);
    const confirmed = await showConfirm({
      title: canSoftDelete ? 'Disattiva Elemento' : 'Elimina Elemento',
      message: canSoftDelete
        ? 'Sei sicuro di voler disattivare questo elemento? Potrai riattivarlo successivamente.'
        : 'Sei sicuro di voler eliminare definitivamente questo elemento?',
      variant: canSoftDelete ? 'INFO' : 'DANGER',
      confirmText: canSoftDelete ? 'Disattiva' : 'Elimina',
      cancelText: 'Annulla'
    });

    if (!confirmed) return;

    if (id === editingId) {
      resetAllForms();
    }

    if (canSoftDelete) {
      const now = new Date().toISOString();
      const softDeleteMapping: Record<string, 'attiva' | 'attivo'> = {
        aree: 'attiva',
        linee: 'attiva',
        varieta: 'attiva',
        prodottiGrezzi: 'attivo',
        tipologie: 'attivo',
        calibri: 'attivo',
        articoli: 'attivo',
        imballi: 'attivo'
      };
      const flag = softDeleteMapping[key as string];
      // @ts-ignore
      onUpdateData({ [key]: (data[key] as any[]).map((item) => item.id === id ? { ...item, [flag]: false, updatedAt: now } : item) });
      return;
    }

    // @ts-ignore
    onUpdateData({ [key]: (data[key] as any[]).filter((item) => item.id !== id) });
  };

  // Helper selectors
  const tipologieProdottoVarieta = data.tipologie
    .filter((tipologia) => tipologia.prodottoId === newVarieta.prodottoId && (mostraDisattivati || tipologia.attivo));
  const tipologieProdottoArticolo = data.tipologie
    .filter((tipologia) => tipologia.prodottoId === newArticolo.prodottoId && (mostraDisattivati || tipologia.attivo));

  // Common Button Component
  const ActionButtons = ({ onSave }: { onSave: () => void }) => (
    <div className="flex gap-2 w-full mt-4">
        {editingId && (
            <button onClick={resetAllForms} className="px-4 py-2 bg-gray-200 text-gray-700 rounded text-sm font-bold hover:bg-gray-300 flex items-center gap-2">
                <RotateCcw size={16} /> Annulla
            </button>
        )}
        <button onClick={onSave} className={`flex-1 ${editingId ? 'bg-orange-500 hover:bg-orange-600' : 'bg-agri-600 hover:bg-agri-700'} text-white rounded p-2 text-sm font-bold flex items-center justify-center gap-2`}>
            {editingId ? <Pencil size={16} /> : <Plus size={16} />} 
            {editingId ? 'Aggiorna Modifiche' : 'Aggiungi Nuovo'}
        </button>
    </div>
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden min-h-[600px] flex">
      {/* Sidebar Tabs */}
      <div className="w-64 bg-gray-50 border-r border-gray-200 p-4 space-y-2">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 px-2">Anagrafiche</h3>
        
        <button onClick={() => setActiveTab('AREE_LINEE')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'AREE_LINEE' ? 'bg-agri-100 text-agri-800' : 'text-gray-600 hover:bg-gray-100'}`}><Factory size={18} /> Aree e Linee</button>
        <button onClick={() => setActiveTab('PRODOTTI')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'PRODOTTI' ? 'bg-agri-100 text-agri-800' : 'text-gray-600 hover:bg-gray-100'}`}>
          <Apple size={18} /> Prodotti
        </button>
        <button onClick={() => setActiveTab('VARIETA')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'VARIETA' ? 'bg-agri-100 text-agri-800' : 'text-gray-600 hover:bg-gray-100'}`}>
          <Sprout size={18} /> Varietà
        </button>
        <button onClick={() => setActiveTab('ARTICOLI')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'ARTICOLI' ? 'bg-agri-100 text-agri-800' : 'text-gray-600 hover:bg-gray-100'}`}>
          <Package size={18} /> Articoli
        </button>
        <button onClick={() => setActiveTab('LOTTI')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'LOTTI' ? 'bg-agri-100 text-agri-800' : 'text-gray-600 hover:bg-gray-100'}`}>
          <Tags size={18} /> Sigle Lotto
        </button>
        <button onClick={() => setActiveTab('IMBALLI')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'IMBALLI' ? 'bg-agri-100 text-agri-800' : 'text-gray-600 hover:bg-gray-100'}`}>
          <Box size={18} /> Imballaggi
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="mb-4 flex items-center justify-end">
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={mostraDisattivati}
              onChange={(event) => setMostraDisattivati(event.target.checked)}
            />
            Mostra disattivati
          </label>
        </div>

        {activeTab === 'AREE_LINEE' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Aree e Linee</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-4 rounded-lg border bg-gray-50 space-y-3">
                <h3 className="font-bold">Area</h3>
                <input type="text" className="w-full border rounded p-2 text-sm" placeholder="Nome area" value={newArea.nome || ''} onChange={e => setNewArea({ ...newArea, nome: e.target.value })} />
                <button onClick={saveArea} className="w-full bg-agri-600 text-white rounded p-2 text-sm font-bold">Salva Area</button>
                <ul className="divide-y border rounded bg-white">
                  {data.aree.filter(a => mostraDisattivati || a.attiva).map(a => <li key={a.id} className="px-3 py-2 flex justify-between text-sm"><span>{a.nome}</span><span className="flex gap-2"><button onClick={() => startEditArea(a)}><Pencil size={14} /></button><button onClick={() => deleteItem('aree', a.id)}><Trash2 size={14} /></button></span></li>)}
                </ul>
              </div>
              <div className="p-4 rounded-lg border bg-gray-50 space-y-3">
                <h3 className="font-bold">Linea</h3>
                <select className="w-full border rounded p-2 text-sm" value={newLinea.areaId || ''} onChange={e => setNewLinea({ ...newLinea, areaId: e.target.value })}>{data.aree.map(a => <option key={a.id} value={a.id}>{a.nome}</option>)}</select>
                <input type="text" className="w-full border rounded p-2 text-sm" placeholder="Nome linea" value={newLinea.nome || ''} onChange={e => setNewLinea({ ...newLinea, nome: e.target.value })} />
                <button onClick={saveLinea} className="w-full bg-agri-600 text-white rounded p-2 text-sm font-bold">Salva Linea</button>
                <ul className="divide-y border rounded bg-white">
                  {data.linee.filter(l => mostraDisattivati || l.attiva).map(l => <li key={l.id} className="px-3 py-2 flex justify-between text-sm"><span>{l.nome} <span className="text-gray-400">({data.aree.find(a => a.id === l.areaId)?.nome || '-'})</span></span><span className="flex gap-2"><button onClick={() => startEditLinea(l)}><Pencil size={14} /></button><button onClick={() => deleteItem('linee', l.id)}><Trash2 size={14} /></button></span></li>)}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* PRODOTTI */}
        {activeTab === 'PRODOTTI' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
              Prodotti {editingId && <span className="text-sm bg-orange-100 text-orange-800 px-2 py-1 rounded font-normal">Modifica in corso...</span>}
            </h2>

            <div className={`p-6 rounded-lg border space-y-4 transition-colors ${editingId ? 'bg-orange-50 border-orange-200' : 'bg-gray-50 border-gray-200'}`}>
              <div className="grid grid-cols-4 gap-4">
                <div className="col-span-1">
                  <label className="block text-xs font-bold text-gray-500 mb-1">Codice</label>
                  <input type="text" className="w-full border rounded p-2 text-sm uppercase font-mono" placeholder="UVA" value={newProdotto.codice || ''} onChange={e => setNewProdotto({ ...newProdotto, codice: e.target.value })} />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-500 mb-1">Nome Prodotto</label>
                  <input type="text" className="w-full border rounded p-2 text-sm" placeholder="Es. Uva da Tavola" value={newProdotto.nome || ''} onChange={e => setNewProdotto({ ...newProdotto, nome: e.target.value })} />
                </div>
                <label className="col-span-1 flex items-center gap-2 text-sm mt-6">
                  <input type="checkbox" checked={newProdotto.attivo !== false} onChange={e => setNewProdotto({ ...newProdotto, attivo: e.target.checked })} />
                  Attivo
                </label>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Tipologie</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      className="flex-1 border rounded p-2 text-sm"
                      placeholder="Aggiungi tipologia"
                      value={nuovaTipologiaNome}
                      onChange={(event) => setNuovaTipologiaNome(event.target.value)}
                      onKeyDown={(event) => event.key === 'Enter' && addTipologiaDraft()}
                    />
                    <button onClick={addTipologiaDraft} className="bg-gray-200 px-3 rounded hover:bg-gray-300"><Plus size={16} /></button>
                  </div>
                  <div className="space-y-1">
                    {draftTipologie.map((tipologia) => (
                      <div key={tipologia.nome} className="flex items-center justify-between bg-blue-50 text-blue-800 text-xs px-2 py-1 rounded">
                        <span>{tipologia.nome}</span>
                        <button onClick={() => removeTipologiaDraft(tipologia.nome)}><Trash2 size={12} /></button>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Calibri</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      className="flex-1 border rounded p-2 text-sm"
                      placeholder="Nome calibro"
                      value={nuovoCalibroNome}
                      onChange={(event) => setNuovoCalibroNome(event.target.value)}
                    />
                    <input
                      type="number"
                      className="w-24 border rounded p-2 text-sm"
                      placeholder="Ord."
                      value={nuovoCalibroOrd}
                      onChange={(event) => setNuovoCalibroOrd(parseInt(event.target.value, 10) || 1)}
                    />
                    <button onClick={addCalibroDraft} className="bg-gray-200 px-3 rounded hover:bg-gray-300"><Plus size={16} /></button>
                  </div>
                  <div className="space-y-1">
                    {draftCalibri.map((calibro) => (
                      <div key={calibro.nome} className="flex items-center justify-between bg-purple-50 text-purple-800 text-xs px-2 py-1 rounded">
                        <span>{calibro.nome} (ord. {calibro.ordinamento})</span>
                        <button onClick={() => removeCalibroDraft(calibro.nome)}><Trash2 size={12} /></button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {!editingId && <p className="text-xs text-gray-500">Suggerimento: salva il prodotto per primo; tipologie e calibri verranno collegati allo stesso salvataggio.</p>}
              <ActionButtons onSave={saveProdotto} />
            </div>

            <ul className="divide-y divide-gray-200 border rounded-lg">
              {data.prodottiGrezzi.filter(p => mostraDisattivati || p.attivo !== false).map(p => (
                <li key={p.id} className={`px-4 py-3 bg-white ${editingId === p.id ? 'ring-2 ring-orange-400 inset-0 z-10' : ''}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="bg-gray-200 px-2 py-0.5 rounded text-xs font-mono font-bold">{p.codice}</span>
                        <span className="font-bold text-lg">{p.nome}</span>
                        {p.attivo === false && <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">Disattivato</span>}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">Tipologie: {data.tipologie.filter(t => t.prodottoId === p.id && t.attivo).map(t => t.nome).join(', ') || '-'}</div>
                      <div className="text-xs text-gray-500">Calibri: {data.calibri.filter(c => c.prodottoId === p.id && c.attivo).sort((a,b) => a.ordinamento - b.ordinamento).map(c => `${c.nome}(${c.ordinamento})`).join(', ') || '-'}</div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => startEditProdotto(p)} className="text-gray-400 hover:text-orange-500 p-2"><Pencil size={16} /></button>
                      <button onClick={() => deleteItem('prodottiGrezzi', p.id)} className="text-gray-400 hover:text-red-500 p-2" title="Disattiva"><Trash2 size={16} /></button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* VARIETA */}
        {activeTab === 'VARIETA' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                Varietà {editingId && <span className="text-sm bg-orange-100 text-orange-800 px-2 py-1 rounded font-normal">Modifica in corso...</span>}
            </h2>
            <div className={`p-4 rounded-lg border space-y-4 transition-colors ${editingId ? 'bg-orange-50 border-orange-200' : 'bg-gray-50 border-gray-200'}`}>
               <div className="grid grid-cols-4 gap-4">
                 <div className="col-span-2">
                    <label className="block text-xs font-bold text-gray-500 mb-1">Prodotto</label>
                    <select className="w-full border rounded p-2 text-sm" value={newVarieta.prodottoId || ''} onChange={e => setNewVarieta({...newVarieta, prodottoId: e.target.value, tipologiaId: ''})}>
                        <option value="">Seleziona...</option>
                        {data.prodottiGrezzi.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
                    </select>
                 </div>
                 <div className="col-span-1">
                    <label className="block text-xs font-bold text-gray-500 mb-1">Codice</label>
                    <input type="text" className="w-full border rounded p-2 text-sm uppercase font-mono" placeholder="CRI" value={newVarieta.codice || ''} onChange={e => setNewVarieta({...newVarieta, codice: e.target.value})} />
                 </div>
                 <div className="col-span-1">
                    <label className="block text-xs font-bold text-gray-500 mb-1">Nome Varietà</label>
                    <input type="text" className="w-full border rounded p-2 text-sm" placeholder="Es. Crimson" value={newVarieta.nome || ''} onChange={e => setNewVarieta({...newVarieta, nome: e.target.value})} />
                 </div>
                 <div className="col-span-4">
                    <label className="block text-xs font-bold text-gray-500 mb-1">Tipologia / Gruppo</label>
                    {newVarieta.prodottoId ? (
                        <select 
                        className="w-full border rounded p-2 text-sm" 
                        value={newVarieta.tipologiaId || ''} 
                        onChange={e => setNewVarieta({...newVarieta, tipologiaId: e.target.value})}
                        >
                        <option value="">Nessuna / Generica</option>
                        {tipologieProdottoVarieta.map(tipologia => <option key={tipologia.id} value={tipologia.id}>{tipologia.nome}</option>)}
                        </select>
                    ) : (
                        <input type="text" disabled className="w-full border rounded p-2 text-sm bg-gray-100 cursor-not-allowed" placeholder="Seleziona prima un prodotto" />
                    )}
                 </div>
               </div>
               <ActionButtons onSave={saveVarieta} />
            </div>
            <ul className="divide-y divide-gray-200 border rounded-lg">
                {data.varieta.filter(v => mostraDisattivati || v.attiva !== false).map(v => {
                    const pName = data.prodottiGrezzi.find(p => p.id === v.prodottoId)?.nome || '?';
                    return (
                        <li key={v.id} className={`px-4 py-3 flex justify-between items-center bg-white ${editingId === v.id ? 'ring-2 ring-orange-400 inset-0 z-10' : ''}`}>
                            <div>
                                <div className="flex items-center gap-2">
                                     <span className="bg-gray-200 px-2 py-0.5 rounded text-xs font-mono font-bold">{v.codice}</span>
                                     <span className="font-bold">{v.nome}</span>
                                </div>
                                {v.tipologiaId && <span className="ml-2 text-xs text-white bg-blue-500 px-2 py-1 rounded">{data.tipologie.find(t => t.id === v.tipologiaId)?.nome || v.tipologiaId}</span>}
                                <span className="ml-2 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">{pName}</span>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => startEditVarieta(v)} className="text-gray-400 hover:text-orange-500"><Pencil size={16} /></button>
                                <button onClick={() => deleteItem('varieta', v.id)} className="text-gray-400 hover:text-red-500"><Trash2 size={16} /></button>
                            </div>
                        </li>
                    )
                })}
            </ul>
          </div>
        )}

        {/* ARTICOLI */}
        {activeTab === 'ARTICOLI' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                Articoli {editingId && <span className="text-sm bg-orange-100 text-orange-800 px-2 py-1 rounded font-normal">Modifica in corso...</span>}
            </h2>
            <div className={`p-4 rounded-lg border space-y-4 transition-colors ${editingId ? 'bg-orange-50 border-orange-200' : 'bg-gray-50 border-gray-200'}`}>
                <div className="grid grid-cols-4 gap-4 items-end">
                    <div className="col-span-1">
                        <label className="block text-xs font-bold text-gray-500 mb-1">Codice</label>
                        <input type="text" className="w-full border rounded p-2 text-sm uppercase font-mono" placeholder="ART" value={newArticolo.codice || ''} onChange={e => setNewArticolo({...newArticolo, codice: e.target.value})} />
                    </div>
                    <div className="col-span-3">
                        <label className="block text-xs font-bold text-gray-500 mb-1">Nome Articolo</label>
                        <input type="text" className="w-full border rounded p-2 text-sm" placeholder="Es. Cestini 10x500g" value={newArticolo.nome || ''} onChange={e => setNewArticolo({...newArticolo, nome: e.target.value})} />
                    </div>
                    <div className="col-span-2">
                        <label className="block text-xs font-bold text-gray-500 mb-1">Prodotto</label>
                        <select 
                          className="w-full border rounded p-2 text-sm" 
                          value={newArticolo.prodottoId || ''} 
                          onChange={e => setNewArticolo({...newArticolo, prodottoId: e.target.value, varietaId: '', tipologiaId: ''})}
                        >
                            <option value="">Qualsiasi Prodotto (Generico)</option>
                            {data.prodottiGrezzi.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
                        </select>
                    </div>
                    
                    <div className="col-span-1">
                        <label className="block text-xs font-bold text-gray-500 mb-1">Vincolo (Opz)</label>
                        <div className="space-y-2">
                            <select 
                                className="w-full border rounded p-2 text-xs" 
                                value={newArticolo.tipologiaId || ''} 
                                onChange={e => setNewArticolo({...newArticolo, tipologiaId: e.target.value, varietaId: ''})} 
                                disabled={!newArticolo.prodottoId || !!newArticolo.varietaId}
                            >
                                <option value="">Qualsiasi Tipologia</option>
                                {tipologieProdottoArticolo.map(tipologia => <option key={tipologia.id} value={tipologia.id}>{tipologia.nome}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="col-span-1">
                        <label className="block text-xs font-bold text-gray-500 mb-1">O Varietà</label>
                        <select 
                                className="w-full border rounded p-2 text-xs" 
                                value={newArticolo.varietaId || ''} 
                                onChange={e => setNewArticolo({...newArticolo, varietaId: e.target.value, tipologiaId: ''})} 
                                disabled={!newArticolo.prodottoId || !!newArticolo.tipologiaId}
                            >
                                <option value="">Qualsiasi Varietà</option>
                                {data.varieta.filter(v => v.prodottoId === newArticolo.prodottoId).map(v => <option key={v.id} value={v.id}>{v.nome}</option>)}
                            </select>
                    </div>

                    <div className="col-span-4">
                        <label className="block text-xs font-bold text-gray-500 mb-1">Peso (Kg)</label>
                        <input type="number" className="w-full border rounded p-2 text-sm" value={newArticolo.pesoColloTeorico || ''} onChange={e => setNewArticolo({...newArticolo, pesoColloTeorico: parseFloat(e.target.value)})} />
                    </div>
                </div>
                <ActionButtons onSave={saveArticolo} />
            </div>

            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                    <th className="px-4 py-2 text-left">Codice</th>
                    <th className="px-4 py-2 text-left">Nome</th>
                    <th className="px-4 py-2 text-left">Vincoli</th>
                    <th className="px-4 py-2 text-left">Peso</th>
                    <th></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.articoli.filter(item => mostraDisattivati || item.attivo !== false).map(item => {
                    const pName = data.prodottiGrezzi.find(p => p.id === item.prodottoId)?.nome || 'Generico / Tutti';
                    let vincolo = "Tutti";
                    if (item.tipologiaId) vincolo = `Tipologia: ${data.tipologie.find(t => t.id === item.tipologiaId)?.nome || item.tipologiaId}`;
                    if (item.varietaId) {
                         const v = data.varieta.find(v => v.id === item.varietaId);
                         vincolo = `Var: ${v?.nome || '?'}`;
                    }

                    return (
                        <tr key={item.id} className={editingId === item.id ? 'bg-orange-50' : ''}>
                            <td className="px-4 py-2 font-mono font-bold">{item.codice}</td>
                            <td className="px-4 py-2">{item.nome}</td>
                            <td className="px-4 py-2">
                                <span className={`block text-xs font-bold ${!item.prodottoId ? 'text-green-600' : 'text-gray-500'}`}>{pName}</span>
                                {item.prodottoId && <span className={`text-xs px-2 py-0.5 rounded ${vincolo === 'Tutti' ? 'bg-gray-100' : 'bg-blue-100 text-blue-800'}`}>{vincolo}</span>}
                            </td>
                            <td className="px-4 py-2">{item.pesoColloTeorico} kg</td>
                            <td className="px-4 py-2 flex gap-2">
                                <button onClick={() => startEditArticolo(item)} className="text-gray-400 hover:text-orange-500"><Pencil size={16} /></button>
                                <button onClick={() => deleteItem('articoli', item.id)} className="text-gray-400 hover:text-red-500"><Trash2 size={16} /></button>
                            </td>
                        </tr>
                    )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* LOTTI */}
        {activeTab === 'LOTTI' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                Gestione Sigle Lotto {editingId && <span className="text-sm bg-orange-100 text-orange-800 px-2 py-1 rounded font-normal">Modifica in corso...</span>}
            </h2>
            <div className={`p-4 rounded-lg border space-y-4 transition-colors ${editingId ? 'bg-orange-50 border-orange-200' : 'bg-gray-50 border-gray-200'}`}>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Codice Lotto</label>
                        <input type="text" className="w-full border rounded p-2 text-sm" placeholder="Es. 1234 o 12345" value={newLotto.code || ''} onChange={e => setNewLotto({...newLotto, code: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Produttore</label>
                        <input type="text" className="w-full border rounded p-2 text-sm" value={newLotto.produttore || ''} onChange={e => setNewLotto({...newLotto, produttore: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Varietà</label>
                        <select className="w-full border rounded p-2 text-sm" value={newLotto.varietaId || ''} onChange={e => setNewLotto({...newLotto, varietaId: e.target.value})}>
                            <option value="">Seleziona...</option>
                            {data.varieta.map(v => (
                                <option key={v.id} value={v.id}>{v.nome} {v.tipologiaId ? `(${data.tipologie.find(t => t.id === v.tipologiaId)?.nome || v.tipologiaId})` : ''}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Campo</label>
                        <input type="text" className="w-full border rounded p-2 text-sm" value={newLotto.campo || ''} onChange={e => setNewLotto({...newLotto, campo: e.target.value})} />
                    </div>
                </div>
                <ActionButtons onSave={saveLotto} />
            </div>
            
             <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead><tr><th className="px-4 py-2 text-left">Codice</th><th className="px-4 py-2 text-left">Dettagli</th><th></th></tr></thead>
              <tbody>
                {data.sigleLotto.map(item => {
                    const vName = data.varieta.find(v => v.id === item.varietaId)?.nome || '?';
                    return (
                        <tr key={item.id} className={editingId === item.id ? 'bg-orange-50' : ''}>
                            <td className="px-4 py-2 font-mono font-bold">{item.code}</td>
                            <td className="px-4 py-2">{item.produttore} - {vName} - {item.campo}</td>
                            <td className="px-4 py-2 flex gap-2">
                                <button onClick={() => startEditLotto(item)} className="text-gray-400 hover:text-orange-500"><Pencil size={16} /></button>
                                <button onClick={() => deleteItem('sigleLotto', item.id)} className="text-gray-400 hover:text-red-500"><Trash2 size={16} /></button>
                            </td>
                        </tr>
                    )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* IMBALLI */}
        {activeTab === 'IMBALLI' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                Imballaggi {editingId && <span className="text-sm bg-orange-100 text-orange-800 px-2 py-1 rounded font-normal">Modifica in corso...</span>}
            </h2>
            <div className={`p-4 rounded-lg border transition-colors ${editingId ? 'bg-orange-50 border-orange-200' : 'bg-gray-50 border-gray-200'}`}>
                <div className="flex gap-4">
                    <div className="w-32">
                        <input type="text" className="w-full border rounded p-2 text-sm uppercase font-mono" placeholder="COD" value={newImballo.codice || ''} onChange={e => setNewImballo({...newImballo, codice: e.target.value})} />
                    </div>
                    <input type="text" className="flex-1 border rounded p-2 text-sm" placeholder="Nome Imballo (es. IFCO Nero)" value={newImballo.nome || ''} onChange={e => setNewImballo({...newImballo, nome: e.target.value})} />
                    <input type="number" className="w-28 border rounded p-2 text-sm" placeholder="Tara Kg" value={newImballo.taraKg || 0} onChange={e => setNewImballo({...newImballo, taraKg: parseFloat(e.target.value) || 0})} />
                </div>
                <ActionButtons onSave={saveImballo} />
            </div>
            <ul className="divide-y divide-gray-200 border rounded-lg">
                {data.imballi.filter(item => mostraDisattivati || item.attivo !== false).map((item) => (
                    <li key={item.id} className={`px-4 py-3 flex justify-between items-center bg-white ${editingId === item.id ? 'ring-2 ring-orange-400 inset-0 z-10' : ''}`}>
                        <div className="flex items-center gap-3">
                            <span className="bg-gray-200 px-2 py-1 rounded font-mono font-bold text-xs">{item.codice}</span>
                            <span>{item.nome}</span>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => startEditImballo(item)} className="text-gray-400 hover:text-orange-500"><Pencil size={16} /></button>
                            <button onClick={() => deleteItem('imballi', item.id)} className="text-gray-400 hover:text-red-500"><Trash2 size={16} /></button>
                        </div>
                    </li>
                ))}
            </ul>
          </div>
        )}

      </div>
    </div>
  );
};

export default SettingsDashboard;
