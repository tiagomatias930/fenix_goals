
import React, { useState } from 'react';
import { Goal } from './types';
import GoalWizard from './components/GoalWizard';
import GoalDashboard from './components/GoalDashboard';
import { Plus, Flame, Trophy, CheckCircle2, Target, Activity, ChevronRight, Sparkles } from 'lucide-react';

export default function App() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [view, setView] = useState<'list' | 'create' | 'dashboard'>('list');
  const [activeGoalId, setActiveGoalId] = useState<string | null>(null);

  const handleSaveGoal = (newGoal: Goal) => {
    setGoals((prev) => [...prev, newGoal]);
    setView('list');
  };

  const handleUpdateGoal = (updatedGoal: Goal) => {
    setGoals((prev) => prev.map((g) => (g.id === updatedGoal.id ? updatedGoal : g)));
  };

  const handleViewGoal = (id: string) => {
    setActiveGoalId(id);
    setView('dashboard');
  };

  const activeGoal = goals.find((g) => g.id === activeGoalId);
  const activeGoals = goals.filter(g => g.status === 'em_andamento');
  const completedGoals = goals.filter(g => g.status === 'concluido');

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-phoenix-500/30">
      <header className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4 cursor-pointer group" onClick={() => setView('list')}>
            <Flame className="w-8 h-8 text-phoenix-500 fill-current" />
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-white leading-none">Fênix Goals</span>
              <span className="text-[10px] font-mono text-phoenix-500 uppercase tracking-widest leading-tight mt-1">Alta Performance</span>
            </div>
          </div>
          
          <button onClick={() => setView('create')} className="px-5 py-2.5 rounded-full bg-phoenix-600 hover:bg-phoenix-500 text-white text-xs font-bold transition-all active:scale-95 shadow-lg shadow-phoenix-900/20">
            NOVO OBJETIVO
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        {view === 'list' && (
          <div className="space-y-16">
            <div className="max-w-3xl">
              <h2 className="text-5xl md:text-7xl font-bold tracking-tighter mb-8 text-white leading-[0.9]">
                Desperte o seu <span className="text-phoenix-500 italic">potencial</span>.
              </h2>
              <p className="text-zinc-400 text-lg leading-relaxed max-w-2xl font-light">
                Metodologia de 12 passos para transformar desejos em realidade através de clareza absoluta.
              </p>
            </div>

            {goals.length === 0 ? (
              <div className="border border-zinc-800 border-dashed rounded-3xl p-24 text-center">
                <Target className="w-12 h-12 text-zinc-700 mx-auto mb-6" />
                <h3 className="text-xl font-bold">Inicie sua primeira jornada</h3>
                <button onClick={() => setView('create')} className="mt-8 bg-white text-zinc-950 px-8 py-3 rounded-full font-bold text-sm shadow-xl">Definir Objetivo Primário</button>
              </div>
            ) : (
              <div className="space-y-20">
                {activeGoals.length > 0 && (
                  <div>
                    <h3 className="text-[11px] font-bold text-phoenix-500 uppercase tracking-[0.4em] mb-10 flex items-center gap-3">
                      <Flame className="w-4 h-4 fill-current" /> JORNADAS ATIVAS
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {activeGoals.map((goal) => (
                        <div key={goal.id} onClick={() => handleViewGoal(goal.id)} className="bg-zinc-900/50 border border-zinc-800 hover:border-phoenix-500/40 p-8 rounded-2xl cursor-pointer transition-all">
                          <h3 className="text-2xl font-bold text-white mb-6 leading-tight">{goal.titulo}</h3>
                          <div className="space-y-4">
                            <div className="flex justify-between text-[10px] font-bold uppercase text-zinc-500">
                              <span>PROGRESSO</span>
                              <span className="text-phoenix-400">STATUS: {goal.status.replace('_', ' ')}</span>
                            </div>
                            <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                              <div className="h-full bg-phoenix-500 transition-all duration-700" style={{ width: `${(goal.plano_acao.filter(t => t.completed).length / Math.max(goal.plano_acao.length, 1)) * 100}%` }} />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {completedGoals.length > 0 && (
                  <div>
                    <h3 className="text-[11px] font-bold text-emerald-500 uppercase tracking-[0.4em] mb-10 flex items-center gap-3">
                      <Trophy className="w-4 h-4" /> SALÃO DE CONQUISTAS
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {completedGoals.map((goal) => (
                        <div key={goal.id} onClick={() => handleViewGoal(goal.id)} className="bg-zinc-900/20 border border-emerald-900/30 p-8 rounded-2xl cursor-pointer hover:border-emerald-500/50 transition-all">
                          <div className="flex justify-between items-start mb-4">
                            <h3 className="text-xl font-bold text-zinc-400">{goal.titulo}</h3>
                            <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                          </div>
                          <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">CONCLUÍDO</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {view === 'create' && <GoalWizard onSave={handleSaveGoal} onCancel={() => setView('list')} />}
        {view === 'dashboard' && activeGoal && <GoalDashboard goal={activeGoal} onBack={() => setView('list')} onUpdate={handleUpdateGoal} />}
      </main>

      <footer className="max-w-6xl mx-auto px-6 py-16 border-t border-zinc-900 text-center opacity-30">
        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em]">Baseado no Seminário Fênix de Brian Tracy</p>
      </footer>
    </div>
  );
}
