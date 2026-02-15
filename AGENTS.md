# AGENTS.md - AgriTrack Production Management System

## 📋 DOCUMENT MAINTENANCE

### Purpose
Questo documento è la **fonte di verità** per tutti gli agenti (umani e AI) che lavorano su AgriTrack. Contiene:
- Glossario del dominio
- Domain model e business rules
- Architettura e decisioni tecniche
- Standard di sviluppo
- Roadmap e priorità

### Update Protocol
**QUESTO DOCUMENTO DEVE ESSERE AGGIORNATO quando:**
- ✅ Si aggiungono/modificano entità del dominio
- ✅ Si cambiano business rules
- ✅ Si prendono decisioni architetturali
- ✅ Si completano milestone della roadmap
- ✅ Si scoprono nuovi requisiti o edge cases
- ✅ Si modificano standard di codice

**Chi aggiorna**: Developer che implementa la modifica
**Quando**: Prima di mergare il codice
**Come**: 
1. Modifica la sezione rilevante
2. Aggiorna "Last Updated" in fondo
3. Aggiorna "Version" se cambio sostanziale

---

## 🎯 PROJECT OVERVIEW

### Mission
AgriTrack è un sistema di **gestione produzione e tracciabilità** per stabilimenti di confezionamento agricolo (frutta, ortaggi). Priorità: **qualità dei dati, usabilità, scalabilità**.

### Target Users
- **Operatori di linea**: Registrazione produzione in tempo reale
- **Responsabili produzione**: Monitoring e supervisione
- **Quality assurance**: Tracciabilità lotti e scarti
- **Management**: Report e analytics (futuro)

### Current Status (v0.2-alpha)
- ✅ Frontend React + TypeScript completo
- ✅ Persistenza su localStorage
- ✅ Anagrafiche base (Prodotti, Varietà, Articoli, Lotti)
- ✅ Gestione sessioni produzione e lavorazioni
- ✅ Tracciabilità pedane con codici univoci
- ✅ Report base con grafici
- 🚧 Calibri e Tipologie come entità separate (in sviluppo)
- 🚧 Testing suite (da implementare)
- 🚧 Backend + Database (pianificato)
- 🚧 Multi-user auth (pianificato)

### Tech Stack
**Frontend**: React 19, TypeScript, Vite, TailwindCSS (via CDN), Recharts
**State**: Custom hooks + localStorage (preparazione per Redux Toolkit)
**Validation**: Zod (runtime) + TypeScript (compile-time)
**Architecture**: Clean Architecture (Domain, Application, Infrastructure layers)
**Deployment**: GitHub Pages (test), Docker-ready (production)

---

## 📖 GLOSSARY - Domain Language

> **Principio**: Usare sempre i termini esatti del glossario nel codice (nomi variabili, tipi, funzioni)

### 🏭 STRUTTURA FISICA

**AREA**
- Zona fisica dello stabilimento (es: "Confezionamento", "Calibratrice")
- Contiene una o più linee di produzione
- Ha flag `attiva: boolean` per soft delete
- **Esempio**: Area "Confezionamento" con 3 linee manuali

**LINEA**
- Postazione/macchinario di lavoro all'interno di un'area
- Identificata da nome univoco (es: "Linea 1", "Calibratrice A")
- Può processare più lavorazioni contemporaneamente (sovrapposizioni permesse)
- Ha flag `attiva: boolean` per soft delete
- **Esempio**: "Linea 2" nell'area "Confezionamento"

---

### 👥 ORGANIZZAZIONE LAVORO

**SESSIONE PRODUZIONE** (ex "Turno")
- Periodo di lavoro continuo di un operatore su un'area
- Ha orario inizio/fine
- Stati possibili: `APERTO` → `PAUSA` ↔ `CHIUSO` (finale)
- Contiene tutte le lavorazioni avviate durante la sessione
- **Relazione**: 1 Sessione Produzione → N Lavorazioni
- **Esempio**: Operatore "Mario" inizia sessione produzione alle 08:00 nell'area "Confezionamento"
- **Nel codice**: Type `SessioneProduzione` (da rinominare da `Turno`)

**PAUSA**
- Interruzione temporanea (di sessione produzione o lavorazione)
- Sempre motivata (es: "Cambio Formato", "Manutenzione", "Pausa Personale")
- Ha `inizio` e `fine` (opzionale se in corso)
- **Business Rule**: Quando sessione produzione va in pausa → tutte le sue lavorazioni attive vanno in pausa automaticamente

---

### 🌱 ANAGRAFICA PRODOTTI

**PRODOTTO GREZZO**
- Tipologia di prodotto agricolo grezzo/non lavorato (es: "Uva da Tavola", "Mandarini", "Albicocche")
- È la classificazione di massimo livello
- Ha molte tipologie e calibri associati (tramite entità separate)
- **Codice**: identificativo breve (es: "UVA", "AGR", "ALB")
- **Esempio**: Prodotto "Uva da Tavola"
- **Nel codice**: Type `ProdottoGrezzo` (da rinominare da `Prodotto`)

**TIPOLOGIA** (ex "Categoria")
- Gruppo/classificazione del prodotto grezzo (es: "Bianca Con Semi", "Rossa Senza Semi", "Clementine")
- **Relazione**: N Tipologie → 1 Prodotto Grezzo (OBBLIGATORIO)
- Specifica per il prodotto (es: "Bianca Con Semi" solo per Uva, "Clementine" solo per Agrumi)
- **Campi**:
  - `nome`: descrizione (es: "Bianca Con Semi", "Rossa Senza Semi")
  - `prodottoId`: FK a Prodotto Grezzo (OBBLIGATORIO)
  - `ordinamento`: per sorting
- **Esempio**: "Bianca Con Semi" è tipologia di "Uva da Tavola"
- **Distinguere da**: Categoria Commerciale (Extra/Prima - futura)

**CALIBRO**
- Classificazione dimensionale del prodotto grezzo
- **Relazione**: N Calibri → 1 Prodotto Grezzo (OBBLIGATORIO)
- Specifico per prodotto (es: "S/M/L" per uva, "1XX/1X/1" per agrumi, "AA/A/B" per albicocche)
- **Campi**:
  - `nome`: descrizione (es: "Large", "1XX", "AA")
  - `prodottoId`: FK a Prodotto Grezzo (OBBLIGATORIO)
  - `ordinamento`: per sorting (dal più grande al più piccolo)
  - `descrizione`: note aggiuntive (opzionale)
- **Esempio**: "1XX" è calibro di "Mandarini"

**VARIETÀ**
- Cultivar specifica del prodotto grezzo (es: "Crimson", "Italia", "Nadorcott")
- **Relazione**: N Varietà → 1 Prodotto Grezzo
- Può appartenere a una tipologia specifica del prodotto
- **Codice**: identificativo breve (es: "CRI", "ITA", "NAD")
- **Esempio**: "Crimson" è varietà di "Uva da Tavola", tipologia "Rossa Senza Semi"
- **Nel codice**: Rinominare campo `categoria` → `tipologiaId`

**ARTICOLO** (Configurazione di Lavorazione)
- Rappresenta una specifica modalità di confezionamento/lavorazione
- Definisce il **formato finale** (es: "Cestini 10x500g", "Cartone 5kg", "Plateau Sfuso")
- Ha un **peso teorico per collo** (usato per stime)
- Ha tipo peso: `EGALIZZATO` (fisso) o `USCENTE` (variabile)
- **Vincoli opzionali** (da più generico a più specifico):
  - Nessun vincolo → articolo generico (può usare qualsiasi prodotto)
  - `prodottoId` → vincolato a un prodotto specifico
  - `tipologiaId` → vincolato a tipologia del prodotto (implica `prodottoId`)
  - `varietaId` → vincolato a varietà specifica (implica `prodottoId`)
- **Codice**: identificativo breve (es: "10x500", "5KG", "SFUSO")
- **Esempio 1**: "Cestini 10x500g" generico (va bene per qualsiasi uva)
- **Esempio 2**: "Cestini 10x500g Bianca SS" (solo uva tipologia "Bianca Senza Semi")
- **Nel codice**: Rinominare campo `categoria` → `tipologiaId`

---

### 📦 TRACCIABILITÀ INPUT

**SIGLA LOTTO**
- Codice identificativo univoco del lotto in ingresso
- **Formato**: Stringa numerica di **4-5 cifre** (es: "1234", "56789")
- Associato a:
  - **Produttore**: nome fornitore (es: "Az. Rossi")
  - **Varietà**: varietà del prodotto grezzo
  - **Campo**: zona di provenienza (es: "Fondo Valle", "Poggio Alto")
- **Scopo**: Tracciabilità from-farm-to-fork
- **Esempio**: Lotto "12345" da "Az. Bianchi", varietà "Crimson", campo "F02"

**DATA INGRESSO**
- Data di arrivo del lotto nello stabilimento
- **Formato**: ISO string `YYYY-MM-DD` (es: "2024-03-15")
- Importante per FIFO (First In First Out)
- **Utility richiesta**: Convertitore Data ↔ DOY (Day of Year)
  - DOY 1 = 1 Gennaio
  - DOY 365 = 31 Dicembre (366 per bisestile)
  - Funzioni: `dateToDay(date)`, `doyToDate(doy, year)`

---

### 🏭 PROCESSO PRODUTTIVO

**LAVORAZIONE** (ex "Sessione di Linea")
- Lavorazione di un articolo specifico su una linea specifica
- **Relazione**: 
  - N Lavorazioni → 1 Sessione Produzione
  - 1 Lavorazione → 1 Linea
  - 1 Lavorazione → 1 Articolo
  - 1 Lavorazione → 1 Sigla Lotto + Data Ingresso
- **Stati**: `ATTIVA` → `PAUSA` ↔ `CHIUSA` (finale, irreversibile)
- Può avere **note** testuali libere
- **Business Rule**: Più lavorazioni possono essere attive sulla stessa linea contemporaneamente (sovrapposizioni permesse)
- **Esempio**: Linea 2 lavora "Cestini 10x500g" dal lotto "12345" entrato il 15/03
- **Nel codice**: Type `Lavorazione` (da rinominare da `SessioneLinea`)

**PEDANA** (Unità Output)
- Unità di tracciabilità dell'output prodotto
- Rappresenta un pallet/pedana fisica
- **Sticker Code** univoco: `P{YY}-{DOY}-{SEQ}`
  - `YY`: Anno (2 cifre, es: "24" per 2024)
  - `DOY`: Day of Year (001-365/366, es: "045" per 14 Febbraio)
  - `SEQ`: Sequenza progressiva giornaliera (reset ogni giorno)
  - **Esempio**: `P24-045-123` = Pedana #123 del 45° giorno del 2024
- **Contenuto**:
  - `numeroColli`: quanti colli/cartoni/ceste
  - `pesoTotale`: peso netto totale in kg
  - `calibroId`: calibro del prodotto (FK, opzionale)
  - `categoriaCommercialeId`: qualità commerciale (FK, opzionale, futuro)
  - `imballoId`: tipo imballo utilizzato (FK)
- **Snapshot immutabili** (per storico):
  - Articolo (nome, codice, id)
  - Lotto ingresso (sigla, data)
  - Imballo (nome, codice)
  - Calibro (nome) - se presente
  - Categoria commerciale (nome) - se presente (futuro)
- **Business Rule**: Snapshot servono per preservare dati storici anche se anagrafiche cambiano
- **Business Rule**: Se si modifica qualsiasi dato della lavorazione che ha uno snapshot nelle pedane (articolo, lotto, imballo, calibro), chiedere conferma se allineare gli snapshot di tutte le pedane esistenti

**SCARTO**
- Materiale scartato/non lavorabile durante produzione
- Classificato per **tipologia scarto** (es: "Marcio", "Sotto Calibro", "Difetto Estetico")
- Tracciato per:
  - Peso (kg)
  - Sessione Produzione di riferimento
  - Sigla Lotto + Data Ingresso
- **Scopo**: Quality control e analisi cause

---

### 📋 ANAGRAFICHE SUPPORTO

**IMBALLO**
- Tipo di contenitore/packaging (es: "Cartone 30x40", "IFCO Green", "Padellina Legno")
- **Codice**: identificativo breve (es: "3040", "IFCO", "LEGNO")
- **Tara** (opzionale): peso contenitore vuoto in kg
- Ha flag `attivo: boolean` per soft delete
- Ha audit fields: `createdAt`, `updatedAt`, `createdBy`, `updatedBy`

**TIPOLOGIA SCARTO**
- Classificazione delle cause di scarto
- **Codice**: identificativo breve (es: "MAR", "SOC", "EST")
- **Nome**: descrizione (es: "Marcio", "Sotto Calibro")
- Può essere specifica per prodotto (opzionale, campo `prodottoId`)
- Ha flag `attiva: boolean` per soft delete
- Ha audit fields: `createdAt`, `updatedAt`, `createdBy`, `updatedBy`

**CATEGORIA COMMERCIALE** (futura)
- Classificazione qualitativa del prodotto finale (es: "Extra", "Prima", "Seconda")
- Diversa da Tipologia (che è gruppo del prodotto grezzo)
- Sarà applicata alle pedane
- **Campi**:
  - `nome`: descrizione (es: "Extra", "Prima", "Seconda")
  - `ordinamento`: per sorting (1, 2, 3)
  - `descrizione`: note aggiuntive (opzionale)
- Ha flag `attiva: boolean`
- Ha audit fields

---

## 🏗️ DOMAIN MODEL

### Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    STRUTTURA FISICA                          │
└─────────────────────────────────────────────────────────────┘

AREA ────1:N───→ LINEA


┌─────────────────────────────────────────────────────────────┐
│                   PROCESSO PRODUTTIVO                         │
└─────────────────────────────────────────────────────────────┘

SESSIONE_PRODUZIONE ────1:1───→ AREA (lavora in)
SESSIONE_PRODUZIONE ────1:N───→ LAVORAZIONE (contiene)
SESSIONE_PRODUZIONE ────1:N───→ SCARTO (registra)

LAVORAZIONE ────N:1───→ SESSIONE_PRODUZIONE
LAVORAZIONE ────N:1───→ LINEA (lavora su)
LAVORAZIONE ────N:1───→ ARTICOLO (produce)
LAVORAZIONE ────N:1───→ SIGLA_LOTTO (usa lotto)
LAVORAZIONE ────1:N───→ PEDANA (genera)

PEDANA ────N:1───→ LAVORAZIONE
PEDANA ────N:1───→ IMBALLO (usa)
PEDANA ────N:0..1───→ CALIBRO (opzionale)
PEDANA ────N:0..1───→ CATEGORIA_COMMERCIALE (opzionale, futuro)


┌─────────────────────────────────────────────────────────────┐
│                  ANAGRAFICA PRODOTTI                          │
└─────────────────────────────────────────────────────────────┘

PRODOTTO_GREZZO ────1:N───→ TIPOLOGIA (gruppi prodotto)
PRODOTTO_GREZZO ────1:N───→ CALIBRO (dimensioni prodotto)
PRODOTTO_GREZZO ────1:N───→ VARIETÀ

TIPOLOGIA ────N:1───→ PRODOTTO_GREZZO (OBBLIGATORIO)

CALIBRO ────N:1───→ PRODOTTO_GREZZO (OBBLIGATORIO)

VARIETÀ ────N:1───→ PRODOTTO_GREZZO
VARIETÀ ────N:0..1───→ TIPOLOGIA

ARTICOLO ────N:0..1───→ PRODOTTO_GREZZO (vincolo opzionale)
ARTICOLO ────N:0..1───→ TIPOLOGIA (vincolo opzionale)
ARTICOLO ────N:0..1───→ VARIETÀ (vincolo opzionale)

SIGLA_LOTTO ────N:1───→ VARIETÀ


┌─────────────────────────────────────────────────────────────┐
│                    ALTRI COLLEGAMENTI                         │
└─────────────────────────────────────────────────────────────┘

SCARTO ────N:1───→ SIGLA_LOTTO
SCARTO ────N:1───→ TIPOLOGIA_SCARTO
```

### Aggregates (DDD)

**Aggregate Root: SESSIONE_PRODUZIONE**
```
SESSIONE_PRODUZIONE (root)
├── pause: PausaEvento[]
├── LAVORAZIONI[] (owned)
│   ├── pause: PausaEvento[]
│   └── PEDANE[] (owned)
└── SCARTI[] (owned)
```

**Implicazioni**:
- Eliminare una sessione produzione → elimina tutte le lavorazioni e pedane associate
- Le lavorazioni non possono esistere senza sessione produzione
- Le pedane non possono esistere senza lavorazione

### New Entities (v0.2)

**TIPOLOGIA** (ex array di stringhe in Prodotto)
```typescript
interface Tipologia {
  id: string;
  nome: string;              // "Bianca Con Semi", "Rossa Senza Semi"
  prodottoId: string;        // FK a ProdottoGrezzo (OBBLIGATORIO)
  ordinamento: number;       // per sorting
  attivo: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}
```

**CALIBRO** (ex array di stringhe in Prodotto)
```typescript
interface Calibro {
  id: string;
  nome: string;              // "Large", "1XX", "AA"
  prodottoId: string;        // FK a ProdottoGrezzo (OBBLIGATORIO)
  ordinamento: number;       // per sorting (dal più grande al più piccolo)
  descrizione?: string;      // note aggiuntive
  attivo: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}
```

**CATEGORIA_COMMERCIALE** (futura)
```typescript
interface CategoriaCommerciale {
  id: string;
  nome: string;              // "Extra", "Prima", "Seconda"
  ordinamento: number;       // 1, 2, 3
  descrizione?: string;
  attivo: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}
```

---

## 🔒 BUSINESS RULES

### R1. Compatibilità Articolo ↔ Lotto

**Regola**: Un articolo può lavorare un lotto SE:

```typescript
function isCompatible(
  articolo: Articolo, 
  lotto: SiglaLotto, 
  varieta: Varieta,
  tipologia?: Tipologia
): boolean {
  // Caso 1: Articolo generico (nessun vincolo)
  if (!articolo.prodottoId) {
    return true;
  }
  
  // Caso 2: Prodotto deve coincidere
  if (articolo.prodottoId !== varieta.prodottoId) {
    return false;
  }
  
  // Caso 3: Se articolo vincolato a varietà
  if (articolo.varietaId && articolo.varietaId !== lotto.varietaId) {
    return false;
  }
  
  // Caso 4: Se articolo vincolato a tipologia
  if (articolo.tipologiaId && articolo.tipologiaId !== varieta.tipologiaId) {
    return false;
  }
  
  return true;
}
```

**Implementazione**: `ArticoloLottoCompatibilityService.isCompatible()`

---

### R2. Unicità Sticker Pedana

**Formato**: `P{YY}-{DOY}-{SEQ}`
- `SEQ` è progressivo giornaliero (reset ogni notte a 00:00)
- Calcolo DOY:
  ```typescript
  function computeDoy(date: Date = new Date()): number {
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = date.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay);
  }
  
  function doyToDate(doy: number, year: number): Date {
    const start = new Date(year, 0, 0);
    return new Date(start.getTime() + doy * 24 * 60 * 60 * 1000);
  }
  ```
- **Implementazione**: `StickerGenerationService.generateNext()`

---

### R3. Ciclo di Vita Stati

**SESSIONE PRODUZIONE**:
```
APERTO ←→ PAUSA → CHIUSO
  ↑                  ↓
  └────(forbidden)───┘
```
- CHIUSO è irreversibile
- Quando Sessione Produzione → PAUSA: tutte le lavorazioni attive → PAUSA (automatico)
- Quando Sessione Produzione → CHIUSO: tutte le lavorazioni non chiuse → CHIUSE (automatico)

**LAVORAZIONE**:
```
ATTIVA ←→ PAUSA → CHIUSA
  ↑                  ↓
  └────(forbidden)───┘
```
- CHIUSA è irreversibile
- Può andare in PAUSA indipendentemente o per pausa sessione produzione

---

### R4. Sovrapposizioni su Linea

**Regola**: Una linea può avere più lavorazioni attive contemporaneamente.

**Comportamento**:
- Sistema mostra warning all'utente
- Ma permette di procedere
- Utile per: 
  - Cambio lotto rapido
  - Lavorazioni parallele (es: calibratura + confezionamento)

**Implementazione**: `SessioneConflictService.findConflicts()` - usato solo per UI warning

---

### R5. Immutabilità e Allineamento Snapshot

**Regola Base**: I dati delle pedane sono "foto storiche" immutabili

**Razionale**:
- Se modifico nome articolo, le pedane vecchie mantengono il nome originale
- Garantisce tracciabilità accurata nel tempo
- Evita inconsistenze in storico

**Campi snapshot**:
```typescript
interface Pedana {
  snapshotArticolo: { id, nome, codice }  // articolo ha ancora codice
  snapshotIngresso: { siglaLottoId, lottoCode, dataIngresso }
  snapshotImballo: { codice, nome }       // imballo ha ancora codice
  snapshotCalibro?: { nome }              // solo nome, NO codice
  snapshotCategoria?: { nome }            // solo nome, NO codice (futuro)
}
```

**Eccezione - Allineamento Esplicito**:
Se si modifica **QUALSIASI dato** di una lavorazione che ha snapshot nelle pedane (articolo, lotto ingresso, imballo usato, calibro):
1. Sistema chiede conferma all'utente
2. Se confermato → aggiorna gli snapshot di tutte le pedane della lavorazione
3. Se rifiutato → le pedane mantengono i dati originali

**Casi d'uso**:
- Cambio articolo della lavorazione → chiede se aggiornare `snapshotArticolo` di tutte le pedane
- Cambio lotto della lavorazione → chiede se aggiornare `snapshotIngresso` di tutte le pedane
- Modifico imballo predefinito → chiede se aggiornare `snapshotImballo` delle pedane che usano quel imballo
- Modifico calibro predefinito → chiede se aggiornare `snapshotCalibro` delle pedane che usano quel calibro

**Implementazione**: 
```typescript
// Generico: per qualsiasi modifica di dato con snapshot
async function handleUpdateLavorazioneWithSnapshots(
  lavorazioneId: string, 
  updates: Partial<Lavorazione>,
  snapshotUpdates: SnapshotUpdate[]  // array di snapshot da aggiornare
) {
  const lavorazione = await getLavorazione(lavorazioneId);
  const pedane = await getPedaneByLavorazione(lavorazioneId);
  
  if (pedane.length > 0 && snapshotUpdates.length > 0) {
    const snapshotNames = snapshotUpdates.map(s => s.label).join(', ');
    
    const confirmed = await showConfirm({
      title: 'Aggiorna Pedane Esistenti?',
      message: `Questa lavorazione ha ${pedane.length} pedane già create.
                Stai modificando: ${snapshotNames}.
                Vuoi aggiornare anche i dati delle pedane?`,
      confirmText: 'Sì, Aggiorna Tutte',
      cancelText: 'No, Mantieni Originali',
      variant: 'INFO'
    });
    
    if (confirmed) {
      for (const pedana of pedane) {
        const updatedSnapshots = {};
        
        for (const snapshotUpdate of snapshotUpdates) {
          updatedSnapshots[snapshotUpdate.key] = snapshotUpdate.newValue;
        }
        
        await updatePedana({
          ...pedana,
          ...updatedSnapshots
        });
      }
    }
  }
  
  await updateLavorazione({ ...lavorazione, ...updates });
}

// Esempio: cambio articolo
await handleUpdateLavorazioneWithSnapshots(
  lavorazioneId,
  { articoloId: newArticoloId },
  [{ 
    key: 'snapshotArticolo', 
    label: 'Articolo',
    newValue: { id: newArticolo.id, nome: newArticolo.nome, codice: newArticolo.codice }
  }]
);

// Esempio: cambio articolo + lotto insieme
await handleUpdateLavorazioneWithSnapshots(
  lavorazioneId,
  { articoloId: newArticoloId, siglaLottoId: newLottoId, dataIngresso: newData },
  [
    { 
      key: 'snapshotArticolo', 
      label: 'Articolo',
      newValue: { id: newArticolo.id, nome: newArticolo.nome, codice: newArticolo.codice }
    },
    { 
      key: 'snapshotIngresso', 
      label: 'Lotto Ingresso',
      newValue: { siglaLottoId: newLottoId, lottoCode: newLotto.sigla, dataIngresso: newData }
    }
  ]
);
```

---

### R6. Referential Integrity

**Constraint forti** (no eliminazione se in uso):
- Tipologia → deve esistere Prodotto Grezzo
- Calibro → deve esistere Prodotto Grezzo
- Varietà → deve esistere Prodotto Grezzo
- Articolo con `varietaId` → deve esistere Varietà
- Articolo con `tipologiaId` → deve esistere Tipologia
- Lavorazione → deve esistere Articolo valido
- Lavorazione → deve esistere Sigla Lotto valida

**Implementazione futura** (con backend):
- Foreign keys DB
- Soft delete per anagrafiche invece di hard delete
- Cascade rules

---

### R7. Temporalità

**Invarianti temporali**:
```typescript
// Sempre vero:
entity.inizio != null
entity.fine >= entity.inizio (se presente)
entity.status === 'CHIUSO'/'CHIUSA' ⟺ entity.fine != null

// Per pause:
pausa.inizio != null
pausa.fine >= pausa.inizio (se presente)
pausaAttiva ⟺ pausa.fine == null
```

---

### R8. Vincoli Tipologia e Calibro

**Regola**: Tipologia e Calibro devono appartenere allo stesso prodotto delle entità che le referenziano

```typescript
// Varietà con tipologia
varieta.tipologiaId 
  → tipologia.prodottoId === varieta.prodottoId

// Articolo con tipologia
articolo.tipologiaId 
  → tipologia.prodottoId === articolo.prodottoId

// Pedana con calibro
pedana.calibroId 
  → calibro.prodottoId === prodottoDellaLavorazione
```

**Validazione**: Fare check in fase di salvataggio

---

## 🏛️ ARCHITECTURE

### Clean Architecture Layers

```
┌─────────────────────────────────────────┐
│          PRESENTATION (UI)              │  ← React Components, Pages
│  - Components (Smart/Dumb)              │
│  - Custom Hooks (useXXX)                │
│  - Pages                                │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│      APPLICATION SERVICES               │  ← Orchestration, Use Cases
│  - SessioneApplicationService           │
│  - TurnoApplicationService              │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│         DOMAIN SERVICES                 │  ← Business Logic
│  - ArticoloLottoCompatibilityService    │
│  - SessioneConflictService              │
│  - StickerGenerationService             │
│  - ProductionValidationService          │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│      REPOSITORY INTERFACES              │  ← Contracts
│  - ISessioneRepository                  │
│  - ITurnoRepository                     │
│  - IPedanaRepository, etc.              │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│   INFRASTRUCTURE (Persistence)          │  ← Concrete Implementations
│  - LocalStorageSessioneRepository       │
│  - LocalStorageTurnoRepository          │
│  - (Future: PostgresSessioneRepository) │
└─────────────────────────────────────────┘
```

### Directory Structure

```
src/
├── app/                    # Application setup
│   ├── providers/          # Context providers
│   └── routes/             # Routing logic
│
├── pages/                  # Page components
│   ├── HomePage/
│   ├── ReportPage/
│   └── SettingsPage/
│
├── features/               # Feature modules
│   ├── turno/
│   ├── sessione/
│   ├── pedana/
│   └── anagrafica/
│
├── components/             # Shared UI components
│   ├── SessionCard.tsx
│   ├── SmartSelect.tsx
│   ├── DialogContext.tsx
│   └── ...
│
├── hooks/                  # Custom hooks
│   ├── useAppStateStore.ts
│   ├── useTurnoActions.ts
│   ├── useSessioneActions.ts
│   └── ...
│
├── core/                   # Clean Architecture core
│   ├── services/
│   │   ├── application/    # Use cases
│   │   └── domain/         # Domain services
│   ├── repositories/
│   │   ├── interfaces/
│   │   └── localStorage/
│   ├── validators/
│   └── errors/
│
├── types.ts                # Domain types
├── constants.ts            # Initial data, configs
└── utils.ts                # Utilities
```

### Key Architectural Decisions

**ADR-001: Repository Pattern**
- **Decision**: Astrarre persistenza tramite repository interfaces
- **Rationale**: Facilita migrazione da localStorage → PostgreSQL
- **Status**: Implemented
- **Alternatives considered**: Direct localStorage access, MobX

**ADR-002: Custom Hooks per Logic**
- **Decision**: Business logic nei custom hooks, non in components
- **Rationale**: Separation of concerns, testability
- **Status**: Implemented
- **Constraints**: Hook devono essere puri (no side effects diretti)

**ADR-003: Immutable State Updates**
- **Decision**: Sempre spread operator, mai mutazioni dirette
- **Rationale**: React re-render predictability
- **Status**: Implemented
- **Example**: `setState(prev => ({ ...prev, turni: [...prev.turni, newTurno] }))`

**ADR-004: Snapshot Pattern per Storico**
- **Decision**: Pedane salvano snapshot di entità correlate
- **Rationale**: Immutabilità storico, resilienza a modifiche anagrafiche
- **Status**: Implemented
- **Trade-off**: Denormalizzazione (più storage, ma query più semplici)

**ADR-005: Zod per Runtime Validation**
- **Decision**: Validare dati da localStorage con Zod schema
- **Rationale**: Protezione da corruzioni, retrocompatibilità
- **Status**: Implemented
- **Future**: Zod anche per form validation

---

## 💻 DEVELOPMENT STANDARDS

### Naming Conventions

**Types & Interfaces**
```typescript
// PascalCase per tipi
interface Turno { }
type TipoPeso = 'EGALIZZATO' | 'USCENTE';

// Suffissi per chiarezza
interface TurnoApplicationService { }
interface ITurnoRepository { }          // I- per interface
class LocalStorageTurnoRepository { }

// Enums con SCREAMING_SNAKE
enum TurnoStatus {
  APERTO = 'APERTO',
  PAUSA = 'PAUSA',
  CHIUSO = 'CHIUSO'
}
```

**Functions & Variables**
```typescript
// camelCase
const activeTurno = ...;
function handleStartTurno() { }

// Prefissi comuni
const isValid = ...;         // boolean
const hasPermission = ...;   // boolean
const shouldUpdate = ...;    // boolean
const getTurnoById = ...;    // getter
const computeDoy = ...;      // computation
const handleClick = ...;     // event handler
const onSave = ...;          // callback prop
```

**Components**
```typescript
// PascalCase
export const SessionCard: React.FC<SessionCardProps> = ({ ... }) => { };

// Props interface con suffisso
interface SessionCardProps {
  sessione: Sessione;
  onClose: () => void;
}

// Event handlers: handle* per internal, on* per props
function handleLocalClick() { }
<Button onClick={onClose} />
```

**Files**
```
PascalCase.tsx     → Components, Pages
camelCase.ts       → Utils, hooks, services
SCREAMING.md       → Documentation
lowercase.config   → Configs
```

### Code Organization Patterns

**Custom Hooks Structure**
```typescript
export const useTurnoActions = ({ state, setState, ... }: Params) => {
  // 1. Derived state (useMemo, computations)
  const activeTurno = useMemo(() => ..., [state.turni]);
  
  // 2. Handlers (useCallback)
  const handleStartTurno = useCallback(() => { ... }, [dependencies]);
  
  // 3. Return API
  return {
    activeTurno,
    handleStartTurno,
    handleCloseTurno,
    ...
  };
};
```

**Component Structure**
```typescript
export const SessionCard: React.FC<Props> = ({ sessione, onClose }) => {
  // 1. Hooks (useState, useEffect, custom hooks)
  const [isExpanded, setIsExpanded] = useState(false);
  
  // 2. Derived values
  const isPaused = sessione.status === 'PAUSA';
  
  // 3. Event handlers
  const handleToggleExpand = () => setIsExpanded(prev => !prev);
  
  // 4. Effects
  useEffect(() => { ... }, []);
  
  // 5. Render
  return <div>...</div>;
};
```

### Error Handling

**Pattern**: Custom error classes + try-catch + user-friendly dialogs

```typescript
// Domain errors
export class DataAccessError extends Error {
  constructor(message: string, public cause?: unknown) {
    super(message);
    this.name = 'DataAccessError';
  }
}

export class ValidationError extends Error { ... }

// Usage in services
try {
  const data = await repository.load();
  const validation = Schema.safeParse(data);
  if (!validation.success) {
    throw new ValidationError('Invalid data', validation.error);
  }
} catch (error) {
  if (error instanceof ValidationError) {
    // Handle specific error
  }
  // Fallback
  showAlert({ title: 'Errore', message: error.message, variant: 'DANGER' });
}
```

**Never**: Silent failures, console.log errors in production

### State Update Pattern

**Always immutable**:
```typescript
// ✅ CORRECT
setState(prev => ({
  ...prev,
  turni: prev.turni.map(t => 
    t.id === turnoId ? { ...t, status: 'CHIUSO' } : t
  )
}));

// ❌ WRONG
const turno = state.turni.find(t => t.id === turnoId);
turno.status = 'CHIUSO';  // MUTATION!
setState(state);
```

### Testing Guidelines (Future)

**Unit tests** (Vitest):
- Domain services (business logic)
- Utilities (formatTime, computeDoy)
- Repository implementations
- Custom hooks (React Testing Library)

**Integration tests**:
- Full flows (start turno → create sessione → add pedana)
- State migrations

**E2E tests** (Playwright - futuro):
- Critical user journeys
- Multi-step workflows

**Coverage target**: 80% for core domain logic

---

## 🗺️ ROADMAP

### FASE 1: REFACTORING & STABILIZZAZIONE (Current - 3 settimane)

**Obiettivo**: Base solida, terminologia coerente, schema pronto per database

#### 1.1 Terminology Refactoring ⭐ (Priority: CRITICAL)
- [ ] Rinominare `Turno` → `SessioneProduzione` ovunque
  - Types, interfaces, components, hooks, services
  - DB fields: `turnoId` → `sessioneProduzioneId`
  - UI labels e testi
- [ ] Rinominare `SessioneLinea` → `Lavorazione` ovunque
  - Types, interfaces, components, hooks, services
  - Filenames: `useSessioneActions` → `useLavorazioneActions`
- [ ] Rinominare `Prodotto` → `ProdottoGrezzo`
- [ ] Rinominare campo `categoria` → `tipologiaId` (Varietà, Articolo)
- [ ] **Test**: Verificare nessun riferimento ai vecchi nomi
- [ ] **Documentation**: Aggiornare README, commenti, JSDoc

#### 1.2 Nuove Entità Master Data ⭐ (Priority: CRITICAL)
- [ ] **Creare entità Tipologia**
  - Type definition in `types.ts`
  - Zod schema
  - Initial data in `constants.ts` (migrare da Prodotto.categorie)
  - Repository interface + localStorage impl
  - CRUD UI in SettingsPage
  - Migration script per convertire dati esistenti
- [ ] **Creare entità Calibro**
  - Type definition in `types.ts`
  - Zod schema  
  - Initial data in `constants.ts` (migrare da Prodotto.calibri)
  - Repository interface + localStorage impl
  - CRUD UI in SettingsPage
  - Migration script per convertire dati esistenti
- [ ] **Aggiornare Prodotto Grezzo**
  - Rimuovere campi `categorie` e `calibri`
  - Le tipologie e calibri ora hanno FK `prodottoId`
- [ ] **Aggiornare Varietà**
  - Rinominare `categoria: string` → `tipologiaId: string`
  - FK a tabella Tipologia
- [ ] **Aggiornare Articolo**
  - Rinominare `categoria: string` → `tipologiaId: string`
  - FK a tabella Tipologia
- [ ] **Aggiornare Pedana**
  - Aggiungere `calibroId?: string` (FK)
  - Aggiungere `categoriaCommercialeId?: string` (FK, futuro)
  - Aggiungere snapshot: `snapshotCalibro`, `snapshotCategoria`
  - Mantenere `calibro?: string` per backward compatibility temporanea

#### 1.3 Audit Fields ✅ (Priority: HIGH)
- [ ] Aggiungere a tutte le entità master data:
  ```typescript
  createdAt: string;    // ISO date
  updatedAt: string;    // ISO date
  createdBy?: string;   // user ID (opzionale per ora)
  updatedBy?: string;   // user ID (opzionale per ora)
  ```
- [ ] Entità da aggiornare:
  - Area, Linea
  - ProdottoGrezzo, Tipologia, Calibro, Varietà, Articolo
  - SiglaLotto, Imballo, TipologiaScarto
  - CategoriaCommerciale (futura)
- [ ] Auto-set su create/update
- [ ] Migration per dati esistenti (default: now)

#### 1.4 Soft Delete ✅ (Priority: HIGH)
- [ ] Già presente: `attivo: boolean` su molte entità
- [ ] Estendere a tutte le anagrafiche mancanti
- [ ] Implementare validazione: impedire eliminazione se in uso
  - Prodotto → se ha Tipologie/Calibri/Varietà
  - Tipologia → se usata in Varietà/Articoli
  - Calibro → se usato in Pedane
  - Varietà → se usata in SigleLotto
  - Articolo → se usato in Lavorazioni
- [ ] UI: Pulsante "Disattiva" invece di "Elimina"
- [ ] UI: Filtro "Mostra disattivati" (solo admin futuro)

#### 1.5 Schema Versioning ✅ (Priority: HIGH)
- [ ] Aggiungere `schemaVersion: string` a AppState
- [ ] Versione corrente: `"0.2.0"`
- [ ] Implementare migration utility
- [ ] Migration 0.1 → 0.2:
  - Rename Turno → SessioneProduzione
  - Rename SessioneLinea → Lavorazione
  - Migrare categorie array → entità Tipologia
  - Migrare calibri array → entità Calibro
  - Aggiungere audit fields (default values)
- [ ] Test migration con dati reali v0.1
- [ ] Documentare in `MIGRATIONS.md`

#### 1.6 Data Ingresso DOY Utils ✅ (Priority: HIGH)
- [ ] Implementare `computeDoy(date: Date): number`
- [ ] Implementare `doyToDate(doy: number, year: number): Date`
- [ ] Aggiungere campo computed `doyIngresso?: number` a Lavorazione (opzionale)
- [ ] UI: Mostrare DOY accanto a data ingresso
- [ ] Test: Edge cases (bisestile, inizio/fine anno)

#### 1.7 Snapshot Alignment Workflow ✅ (Priority: MEDIUM)
- [ ] Implementare modal conferma generico quando si modifica **qualsiasi dato con snapshot**:
  - Articolo della lavorazione
  - Lotto ingresso della lavorazione
  - Imballo (se si vuole applicare a tutte le pedane)
  - Calibro predefinito (se applicabile)
- [ ] Modal mostra:
  - Numero pedane coinvolte
  - Quali snapshot verranno aggiornati (es: "Articolo, Lotto Ingresso")
  - Opzioni: "Aggiorna Tutte" / "Mantieni Originali"
- [ ] Se conferma → aggiorna tutti gli snapshot rilevanti
- [ ] Supporto per aggiornamenti multipli (es: cambio articolo + lotto insieme)
- [ ] Test: Verificare che snapshot si aggiornino correttamente per ogni tipo

---

### FASE 2: TESTING & QUALITY (2 settimane)

**Obiettivo**: Affidabilità e manutenibilità

#### 2.1 Unit Testing
- [ ] Setup Vitest + React Testing Library
- [ ] Test domain services:
  - ArticoloLottoCompatibilityService
  - StickerGenerationService
  - ProductionValidationService
- [ ] Test utilities:
  - formatTime, formatDateTime
  - computeDoy, doyToDate, updateIsoTime
- [ ] Test hooks critici:
  - useLavorazioneActions
  - useSessioneProduzioneActions
- [ ] Coverage target: 60%

#### 2.2 Integration Testing
- [ ] Test full flow: SessioneProduzione → Lavorazione → Pedana
- [ ] Test migration da v0.1 a v0.2
- [ ] Test error recovery (corrupted localStorage)
- [ ] Test compatibilità articolo-lotto

#### 2.3 Error Boundaries & Resilience
- [ ] React Error Boundaries per crash recovery
- [ ] Fallback UI per errori critici
- [ ] Auto-save ogni N secondi (debounced)
- [ ] Export/Import backup (JSON)
- [ ] Test: Recovery da errori

---

### FASE 3: UX IMPROVEMENTS (2-3 settimane)

**Obiettivo**: Produttività operatori

#### 3.1 Advanced Filtering
- [ ] Filter builder per sessioni/pedane
- [ ] Multi-select filters (linee, articoli, lotti)
- [ ] Date range picker
- [ ] Saved filters (localStorage)

#### 3.2 Batch Operations
- [ ] Selezione multipla sessioni (checkbox)
- [ ] Chiudi multiple sessioni con un click
- [ ] Export CSV/Excel selezionati
- [ ] Print selezionati

#### 3.3 Search & Navigation
- [ ] Full-text search su storico (Fuse.js)
- [ ] Keyboard shortcuts (es: Ctrl+K per search)
- [ ] Breadcrumbs navigation
- [ ] Quick actions menu

#### 3.4 Print Layouts
- [ ] Print layout per report turno
- [ ] Print layout per etichette pedana
- [ ] QR code su etichette (per mobile scanning futuro)

---

### FASE 4: BACKEND + DATABASE (3-4 settimane)

**Obiettivo**: Multi-user, persistenza robusta

#### 4.1 Database Schema
- [ ] PostgreSQL setup
- [ ] Tabelle da schema ER corrente
- [ ] Indici per performance
- [ ] Migration scripts
- [ ] Seed data per development

#### 4.2 Backend API (Node.js + Express)
- [ ] REST API endpoints (CRUD)
- [ ] JWT Authentication
- [ ] Role-based permissions (ADMIN, OPERATOR, VIEWER)
- [ ] API documentation (Swagger)
- [ ] Rate limiting

#### 4.3 Frontend Integration
- [ ] Sostituire localStorage con API calls
- [ ] React Query per caching & sync
- [ ] Optimistic updates
- [ ] Offline mode (service worker + sync queue)
- [ ] WebSocket per real-time updates

#### 4.4 Deployment
- [ ] Docker containers (frontend + backend + db)
- [ ] Docker Compose per local dev
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Deploy su VPS/Cloud (DigitalOcean, AWS, etc.)

---

### FASE 5: MOBILE & ADVANCED FEATURES (Long-term)

#### 5.1 PWA Capabilities
- [ ] Service Worker per offline
- [ ] Add to Home Screen
- [ ] Push notifications
- [ ] Background sync

#### 5.2 Mobile App (React Native - opzionale)
- [ ] Shared business logic (core/)
- [ ] Native UI per iOS/Android
- [ ] Camera integration (QR scan)
- [ ] Bluetooth per bilance/stampanti

#### 5.3 Analytics & Reporting
- [ ] Dashboard KPI real-time
- [ ] Custom report builder
- [ ] Export PDF con grafici
- [ ] Email/Slack notifications

#### 5.4 IoT Integration
- [ ] Integrazione bilance automatiche
- [ ] Lettura RFID/Barcode
- [ ] Sensori temperatura/umidità (quality control)

---

## 🛠️ COMMON WORKFLOWS

### Workflow: Aggiungere una Nuova Entità

**Esempio**: Aggiungere entità "Fornitore"

1. **Definire Type** (`types.ts`)
```typescript
export interface Fornitore {
  id: string;
  codice: string;
  nome: string;
  indirizzo?: string;
  attivo: boolean;
  createdAt: string;
  updatedAt: string;
}
```

2. **Aggiungere a AppState** (`types.ts`)
```typescript
export interface AppState {
  // ... existing
  fornitori: Fornitore[];
}
```

3. **Aggiungere Schema Zod** (`core/validators/schemas.ts`)
```typescript
const FornitoreSchema = z.object({
  id: z.string(),
  codice: z.string(),
  nome: z.string(),
  indirizzo: z.string().optional(),
  attivo: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const AppStateSchema = z.object({
  // ... existing
  fornitori: z.array(FornitoreSchema),
});
```

4. **Aggiungere Initial Data** (`constants.ts`)
```typescript
export const INITIAL_FORNITORI: Fornitore[] = [
  { id: 'F1', codice: 'ROSSI', nome: 'Az. Rossi', attivo: true, ... }
];
```

5. **Creare Repository Interface** (`core/repositories/interfaces/IFornitoreRepository.ts`)
```typescript
export interface IFornitoreRepository {
  getAll(): Promise<Fornitore[]>;
  getById(id: string): Promise<Fornitore | null>;
  create(fornitore: Fornitore): Promise<Fornitore>;
  update(fornitore: Fornitore): Promise<Fornitore>;
  delete(id: string): Promise<void>;  // soft delete
}
```

6. **Implementare Repository** (`core/repositories/localStorage/LocalStorageFornitoreRepository.ts`)

7. **Aggiornare UI** (Settings page, SmartSelect, etc.)

8. **Aggiornare Migration** (`core/services/AppStateService.ts`)
```typescript
export const buildInitialState = (): AppState => ({
  // ... existing
  fornitori: INITIAL_FORNITORI,
});
```

9. **Testing**
```typescript
describe('FornitoreRepository', () => {
  it('should create fornitore', async () => { ... });
});
```

10. **Update AGENTS.md** (questo file!)

---

### Workflow: Implementare Nuova Business Rule

**Esempio**: Impedire eliminazione Prodotto se usato in Articoli

1. **Definire Service** (`core/services/domain/ProdottoValidationService.ts`)
```typescript
export class ProdottoValidationService {
  canDelete(prodottoId: string, articoli: Articolo[]): boolean {
    return !articoli.some(a => a.prodottoId === prodottoId);
  }
}
```

2. **Usare in UI Hook** (`hooks/useAnagraficheActions.ts`)
```typescript
const handleDeleteProdotto = async (id: string) => {
  if (!validationService.canDelete(id, state.articoli)) {
    showAlert({ 
      title: 'Impossibile eliminare', 
      message: 'Prodotto in uso da articoli esistenti',
      variant: 'DANGER'
    });
    return;
  }
  // ... proceed
};
```

3. **Aggiungere Test**
```typescript
it('should not allow deletion if in use', () => {
  const articoli = [{ prodottoId: 'P1', ... }];
  expect(service.canDelete('P1', articoli)).toBe(false);
});
```

4. **Update AGENTS.md** con nuova regola

---

### Workflow: Database Migration

**Quando**: Cambio schema (es: aggiungere campo `telefono` a Fornitore)

1. **Incrementare Version** (`types.ts`)
```typescript
const SCHEMA_VERSION = '0.2.0';  // was '0.1.0'
```

2. **Scrivere Migration Function** (`core/services/AppStateService.ts`)
```typescript
function migrateFrom_0_1_to_0_2(state: any): AppState {
  return {
    ...state,
    fornitori: state.fornitori.map((f: any) => ({
      ...f,
      telefono: f.telefono || '',  // default value
    })),
  };
}
```

3. **Aggiornare `normalizeLegacyState`**
```typescript
export const normalizeLegacyState = (raw: any): AppState => {
  let state = raw;
  
  // Apply migrations in order
  if (!state.schemaVersion || state.schemaVersion === '0.1.0') {
    state = migrateFrom_0_1_to_0_2(state);
  }
  
  // Set current version
  state.schemaVersion = SCHEMA_VERSION;
  
  return state;
};
```

4. **Test Migration**
```typescript
it('should migrate from 0.1 to 0.2', () => {
  const oldState = { schemaVersion: '0.1.0', fornitori: [{ id: 'F1' }] };
  const newState = normalizeLegacyState(oldState);
  expect(newState.fornitori[0].telefono).toBe('');
});
```

5. **Document in MIGRATIONS.md**

---

### Workflow: Implementare Snapshot Alignment

**Quando**: Modificare un dato di una lavorazione che ha snapshot nelle pedane

**Principio**: Chiedere sempre conferma utente prima di aggiornare snapshot esistenti

**Pattern Implementativo**:

1. **Identificare i campi da aggiornare**
```typescript
// Esempio: modifica articolo e lotto insieme
const snapshotUpdates: SnapshotUpdate[] = [
  {
    key: 'snapshotArticolo',
    label: 'Articolo',
    newValue: { id: newArticolo.id, nome: newArticolo.nome, codice: newArticolo.codice }
  },
  {
    key: 'snapshotIngresso',
    label: 'Lotto Ingresso',
    newValue: { 
      siglaLottoId: newLotto.id, 
      lottoCode: newLotto.sigla, 
      dataIngresso: newDataIngresso 
    }
  }
];
```

2. **Controllare se ci sono pedane esistenti**
```typescript
const pedane = await getPedaneByLavorazione(lavorazioneId);
if (pedane.length === 0) {
  // Nessuna pedana → aggiorna direttamente senza conferma
  await updateLavorazione({ ...lavorazione, ...updates });
  return;
}
```

3. **Mostrare modal conferma**
```typescript
const snapshotNames = snapshotUpdates.map(s => s.label).join(', ');

const confirmed = await showConfirm({
  title: 'Aggiorna Pedane Esistenti?',
  message: `Questa lavorazione ha ${pedane.length} pedane già create.
            Stai modificando: ${snapshotNames}.
            
            Vuoi aggiornare anche i dati delle pedane?`,
  details: [
    'SÌ → Le pedane riflettono i nuovi dati',
    'NO → Le pedane mantengono i dati originali (tracciabilità storica)'
  ],
  confirmText: 'Sì, Aggiorna Tutte',
  cancelText: 'No, Mantieni Originali',
  variant: 'INFO'
});
```

4. **Aggiornare snapshot se confermato**
```typescript
if (confirmed) {
  for (const pedana of pedane) {
    const updatedSnapshots = {};
    
    for (const update of snapshotUpdates) {
      updatedSnapshots[update.key] = update.newValue;
    }
    
    await updatePedana({
      ...pedana,
      ...updatedSnapshots
    });
  }
}
```

5. **Aggiornare la lavorazione**
```typescript
await updateLavorazione({ ...lavorazione, ...updates });
```

**Casi d'uso comuni**:

- **Cambio articolo**: Aggiorna `snapshotArticolo`
- **Cambio lotto**: Aggiorna `snapshotIngresso`
- **Cambio articolo + lotto**: Aggiorna entrambi gli snapshot
- **Cambio imballo predefinito** (raro): Potenziale aggiornamento `snapshotImballo`

**Note importanti**:
- Non tutti i campi della lavorazione richiedono snapshot alignment
- Solo i campi che hanno un corrispondente `snapshot*` nella pedana
- L'utente deve sempre avere la scelta di mantenere i dati originali

---

## ❓ OPEN QUESTIONS & DECISIONS (Updated)

### ✅ DECISIONI PRESE

**D1: Terminologia "Turno"** → **RISOLTO**
- **Decisione finale**: "Sessione Produzione"
- **Impatto**: Rinominare in tutto il codebase
- **Status**: Da implementare in FASE 1

**D2: Terminologia "Sessione di Linea"** → **RISOLTO**  
- **Decisione finale**: "Lavorazione"
- **Impatto**: Rinominare in tutto il codebase
- **Status**: Da implementare in FASE 1

**D3: Calibri come Entità Separate** → **RISOLTO**
- **Decisione**: SÌ, diventano entità con tabella propria
- **Relazione**: N Calibri → 1 Prodotto Grezzo (OBBLIGATORIO)
- **Campi**: id, nome, prodottoId, ordinamento, descrizione (opzionale), attivo, audit fields
- **Status**: Da implementare in FASE 1

**D4: Categorie come Entità (→ Tipologie)** → **RISOLTO**
- **Decisione**: SÌ, rinominare "Categoria" → "Tipologia" e creare entità separata
- **Relazione**: N Tipologie → 1 Prodotto Grezzo (OBBLIGATORIO)
- **Distinguere da**: Futura "Categoria Commerciale" (Extra/Prima/Seconda)
- **Campi**: id, nome, prodottoId, ordinamento, attivo, audit fields
- **Status**: Da implementare in FASE 1

**D5: Normalizzare prodottoId in Articolo** → **RISOLTO**
- **Decisione**: Mantenere denormalizzato (prodottoId esplicito anche se derivabile)
- **Rationale**: Performance query, DDD patterns
- **Status**: Nessun cambio necessario

**D6: Gestione Scadenze Lotti** → **RISOLTO**
- **Decisione**: NON implementare shelf-life
- **Rationale**: Non richiesto dal business
- **Status**: Non in roadmap

**D7: Audit Log** → **RISOLTO**
- **Decisione**: Audit fields semplice + Event Sourcing futuro
- **Implementazione FASE 1**: Aggiungere a tutte le entità master data:
  - `createdAt: string` (ISO date)
  - `updatedAt: string` (ISO date)
  - `createdBy?: string` (user ID)
  - `updatedBy?: string` (user ID)
- **Implementazione futura**: Event sourcing per audit trail completo
- **Status**: FASE 1 (audit fields), FASE 4+ (event sourcing)

**D8: Snapshot Allineamento** → **RISOLTO**
- **Decisione**: Immutabilità di default + conferma utente per allineamento esplicito
- **Workflow**: Modal conferma quando si modifica **qualsiasi dato** della lavorazione che ha snapshot nelle pedane:
  - Articolo → aggiorna `snapshotArticolo`
  - Lotto ingresso → aggiorna `snapshotIngresso`
  - Imballo → aggiorna `snapshotImballo`
  - Calibro → aggiorna `snapshotCalibro`
  - Categoria commerciale → aggiorna `snapshotCategoria` (futuro)
- **Funzionalità**: Supporto per aggiornamenti multipli simultanei (es: cambio articolo + lotto insieme)
- **Status**: Da implementare in FASE 1

---

### ⚠️ QUESTIONI ANCORA APERTE

**Q1: Eliminazione Anagrafiche in Uso**
- **Problema**: Come gestire richiesta di eliminazione prodotto usato in articoli/varietà?
- **Opzioni**:
  - A) Bloccare con messaggio errore (hard constraint)
  - B) Mostrare warning + conferma con lista dipendenze
  - C) Soft delete automatico (nascondere ma non eliminare)
- **Proposta**: Opzione A (hard constraint) + soft delete button separato per admin
- **Priorità**: Alta (serve per FASE 1)

**Q2: Multi-tenancy Strategy**
- **Problema**: Un'istanza DB = un'azienda o multi-azienda?
- **Opzioni**:
  - A) Single-tenant (DB per azienda)
  - B) Multi-tenant (campo aziendaId ovunque)
- **Proposta**: Single-tenant per semplicità v1, preparare multi-tenant per futuro
- **Priorità**: Media (serve prima di backend FASE 4)

**Q3: Gestione Storico Modifiche Anagrafiche**
- **Problema**: Se cambio nome Tipologia/Calibro, aggiornare anche gli snapshot nelle pedane?
- **Proposta**: NO, gli snapshot restano immutabili (rappresentano il dato COM'ERA al momento)
- **Eccezione**: Solo se utente richiede esplicitamente allineamento (raro)
- **Priorità**: Bassa

**Q4: Ordinamento Calibri - Logica Automatica?**
- **Problema**: Il campo `ordinamento` deve essere manuale o automatico basato su pattern?
- **Esempio**: "XXL" > "XL" > "L" > "M" > "S" (per uva), ma "1XX" > "1X" > "1" (per agrumi)
- **Proposta**: Manuale per flessibilità, ma UI con drag&drop
- **Priorità**: Bassa (FASE 3 - UX)

---

### 💡 DECISIONI DA VALIDARE CON BUSINESS

**B1: Categoria Commerciale - Implementazione**
- **Quando**: Serve categorizzare Extra/Prima/Seconda?
- **Dove**: Solo su pedana finale o anche su lotto in ingresso?
- **Proposta**: Solo su pedana (valutazione post-lavorazione)
- **Validare con**: Quality Manager
- **Deadline**: Prima di FASE 3

**B2: Calibro su Lotto Ingresso**
- **Domanda**: Il calibro è caratteristica del lotto IN INGRESSO o solo dell'OUTPUT?
- **Attuale**: Solo su pedana output
- **Possibile estensione**: Aggiungere anche a SiglaLotto
- **Validare con**: Quality Manager  
- **Deadline**: Prima di FASE 2

**B3: Motivazioni Pausa - Lista Personalizzabile**
- **Attuale**: Array hardcoded in constants.ts
- **Richiesta**: Rendere configurabile da UI?
- **Complessità**: Bassa (anagrafica semplice)
- **Validare con**: Production Manager
- **Deadline**: FASE 2 o 3

---

## 📊 METRICS & KPIs (Future)

### Development Metrics
- Code coverage: Target 80%
- Build time: < 30s
- Bundle size: < 500KB (gzipped)
- Lighthouse score: > 90

### Business Metrics (da Dashboard)
- Pedane prodotte / turno
- Tempo medio sessione
- Percentuale scarti per tipologia
- Utilizzo linee (% tempo attivo)
- FIFO compliance (lotti più vecchi lavorati per primi)

---


### FASE 1 - Execution Strategy (Aggiornata)

Per ridurre rischio regressioni, il refactoring di FASE 1 va eseguito in micro-step con rilascio incrementale:

1. `schemaVersion` + migration pipeline
2. Introduzione entità `Tipologia` e `Calibro` con compatibilità legacy
3. Snapshot alignment workflow su modifica lavorazione
4. Audit fields e soft delete uniformi
5. Rename terminologico completo (`Turno` → `SessioneProduzione`, `SessioneLinea` → `Lavorazione`)

**Decisione operativa**: evitare big-bang rename e mantenere compatibilità temporanea dei campi legacy (`categoria`, `calibro`).

---

## 🔄 CHANGELOG

### Version 0.1.1 (Current - Internal Alignment)
- Added phased execution strategy for FASE 1
- Introduced migration-first approach before full terminology refactor

### Version 0.2.0 (Planned - Q2 2026)
- Schema versioning
- Soft delete
- Testing suite
- Data ingresso DOY utils

### Version 0.1.0 (Current - Q1 2026)
- Initial release
- Core features: Turni, Sessioni, Pedane, Scarti
- Anagrafiche base
- localStorage persistence
- Basic reporting

---

## 📝 CONTRIBUTING GUIDELINES

### Before Starting Work

1. Check ROADMAP for priority
2. Check OPEN QUESTIONS for blocking decisions
3. Create feature branch: `feature/nome-feature`
4. Update AGENTS.md if relevant

### Code Review Checklist

- [ ] Segue naming conventions
- [ ] Aggiornato types.ts se serve
- [ ] Aggiornato Zod schema se serve
- [ ] Test scritti (se applicabile)
- [ ] AGENTS.md aggiornato
- [ ] No `console.log` residui
- [ ] No `any` types
- [ ] Immutable state updates

### Commit Messages

```
feat: Add Fornitore entity to master data
fix: Prevent deletion of Prodotto in use
docs: Update AGENTS.md with new business rule
test: Add tests for ArticoloLottoCompatibility
refactor: Extract validation logic to service
```

---

## RESOURCES

**Repository**: https://github.com/GoatyCoder/AgriTrack-app
**Documentation**: `/docs` folder

---

## 📄 RELATED DOCUMENTS

- `README.md` - Setup e deployment istruzioni
- `MIGRATIONS.md` - Schema migration log (da creare)
- `API.md` - API documentation (futuro backend)
- `DEPLOYMENT.md` - Deployment guide (da creare)

---

**Last Updated**: 2026-02-15
**Version**: 0.1.1
**Maintained by**: Development Team

---
