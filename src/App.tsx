import React, { useState } from 'react';
import { 
  Users, 
  Clock, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  Activity, 
  RotateCcw,
  Sparkles
} from 'lucide-react';

interface QueueItem {
  id: string;
  ticketNumber: string;
  customerName: string;
  service: string;
  status: 'waiting' | 'in-progress' | 'completed';
  waitTime: string;
  desk?: string;
}

const initialQueue: QueueItem[] = [
  { id: '1', ticketNumber: 'A-102', customerName: 'Emma Watson', service: 'Consultatie', status: 'in-progress', waitTime: '2 min', desk: 'Balie 1' },
  { id: '2', ticketNumber: 'A-103', customerName: 'Liam Jansen', service: 'Ondersteuning', status: 'in-progress', waitTime: '5 min', desk: 'Balie 2' },
  { id: '3', ticketNumber: 'A-104', customerName: 'Sophie De Vries', service: 'Check-in', status: 'waiting', waitTime: '8 min' },
  { id: '4', ticketNumber: 'A-105', customerName: 'Noah Bakker', service: 'Consultatie', status: 'waiting', waitTime: '12 min' },
  { id: '5', ticketNumber: 'A-106', customerName: 'Lucas Smit', service: 'Afhalen', status: 'waiting', waitTime: '15 min' },
];

export default function App() {
  const [queue, setQueue] = useState<QueueItem[]>(initialQueue);
  const [newName, setNewName] = useState('');
  const [newService, setNewService] = useState('Consultatie');

  const handleNextTurn = (deskNumber: string) => {
    const nextWaiting = queue.find(item => item.status === 'waiting');
    if (!nextWaiting) return;

    setQueue(prev => prev.map(item => {
      if (item.desk === deskNumber && item.status === 'in-progress') {
        return { ...item, status: 'completed' as const };
      }
      if (item.id === nextWaiting.id) {
        return { ...item, status: 'in-progress' as const, desk: deskNumber, waitTime: '0 min' };
      }
      return item;
    }));
  };

  const handleAddTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const nextNumber = `A-${100 + queue.length + 1}`;
    const newItem: QueueItem = {
      id: Date.now().toString(),
      ticketNumber: nextNumber,
      customerName: newName.trim(),
      service: newService,
      status: 'waiting',
      waitTime: '0 min',
    };

    setQueue(prev => [...prev, newItem]);
    setNewName('');
  };

  const inProgressItems = queue.filter(q => q.status === 'in-progress');
  const waitingItems = queue.filter(q => q.status === 'waiting');
  const completedItems = queue.filter(q => q.status === 'completed');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold tracking-tight text-lg">TurnFlow</span>
              <span className="ml-2 text-xs bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full">Demo</span>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm text-slate-400">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Systeem Actief
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between text-slate-400 text-sm mb-2">
              <span>In Behandeling</span>
              <Activity className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-3xl font-bold text-white">{inProgressItems.length}</div>
            <p className="text-xs text-slate-500 mt-1">2 actieve balies</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between text-slate-400 text-sm mb-2">
              <span>In Wachtrij</span>
              <Users className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-3xl font-bold text-white">{waitingItems.length}</div>
            <p className="text-xs text-slate-500 mt-1">Gem. wachttijd ~8 min</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between text-slate-400 text-sm mb-2">
              <span>Afgehandeld</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-3xl font-bold text-white">{completedItems.length}</div>
            <p className="text-xs text-slate-500 mt-1">Vandaag verwerkt</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between text-slate-400 text-sm mb-2">
              <span>Doorlooptijd</span>
              <Clock className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-3xl font-bold text-white">6.4m</div>
            <p className="text-xs text-emerald-400 mt-1">14% sneller dan doel</p>
          </div>
        </div>

        {/* Action Panel & Balies */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Linker kolom: Balie bediening & Nieuw ticket */}
          <div className="space-y-6">
            {/* Balie Acties */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                Balie Oproep
              </h2>
              <div className="space-y-3">
                <button
                  onClick={() => handleNextTurn('Balie 1')}
                  className="w-full flex items-center justify-between px-4 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition font-medium"
                >
                  <span>Volgende voor <strong>Balie 1</strong></span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleNextTurn('Balie 2')}
                  className="w-full flex items-center justify-between px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition font-medium border border-slate-700"
                >
                  <span>Volgende voor <strong>Balie 2</strong></span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Ticket toevoegen */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-400" />
                Nieuw Ticket Invoeren
              </h2>
              <form onSubmit={handleAddTicket} className="space-y-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Naam bezoeker</label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="bijv. Robin Peeters"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Service Type</label>
                  <select
                    value={newService}
                    onChange={(e) => setNewService(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Consultatie">Consultatie</option>
                    <option value="Ondersteuning">Ondersteuning</option>
                    <option value="Check-in">Check-in</option>
                    <option value="Afhalen">Afhalen</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-lg transition"
                >
                  Ticket genereren
                </button>
              </form>
            </div>
          </div>

          {/* Rechter kolom: Live Wachtrij & In behandeling */}
          <div className="lg:col-span-2 space-y-6">
            {/* Nu aan de beurt */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <h2 className="text-base font-semibold mb-4 text-slate-200">Nu aan de beurt (In Behandeling)</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {inProgressItems.map(item => (
                  <div key={item.id} className="p-4 rounded-lg bg-indigo-950/40 border border-indigo-800/40 flex items-start justify-between">
                    <div>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                        {item.desk}
                      </span>
                      <div className="text-2xl font-bold mt-2 text-white">{item.ticketNumber}</div>
                      <div className="text-sm text-slate-300">{item.customerName}</div>
                      <div className="text-xs text-slate-400 mt-1">{item.service}</div>
                    </div>
                    <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping mt-1 mr-1"></span>
                  </div>
                ))}
                {inProgressItems.length === 0 && (
                  <div className="col-span-2 text-center py-6 text-slate-500 text-sm">
                    Geen actieve sessies op dit moment.
                  </div>
                )}
              </div>
            </div>

            {/* Wachtrij lijst */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-slate-200">Wachtenden ({waitingItems.length})</h2>
                <span className="text-xs text-slate-400">Automatische volgorde</span>
              </div>
              <div className="divide-y divide-slate-800">
                {waitingItems.map((item, idx) => (
                  <div key={item.id} className="py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="w-6 text-xs text-slate-500 font-mono">#{idx + 1}</span>
                      <div>
                        <div className="font-medium text-slate-200 flex items-center gap-2">
                          <span>{item.ticketNumber}</span>
                          <span className="text-slate-400 font-normal">· {item.customerName}</span>
                        </div>
                        <div className="text-xs text-slate-500">{item.service}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{item.waitTime}</span>
                    </div>
                  </div>
                ))}
                {waitingItems.length === 0 && (
                  <div className="text-center py-6 text-slate-500 text-sm">
                    Wachtrij is leeg.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
