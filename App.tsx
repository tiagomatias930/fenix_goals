
import React, { useState, useEffect } from 'react';
import { Goal } from './types';
import GoalWizard from './components/GoalWizard';
import GoalDashboard from './components/GoalDashboard';
import { Plus, Flame, Trophy, CheckCircle2, Target, Activity, ChevronRight, Sparkles, Zap, Star, BookOpen, Heart } from 'lucide-react';

const STORAGE_KEY = 'fenix_goals';

function loadGoals(): Goal[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export default function App() {
  const [goals, setGoals] = useState<Goal[]>(loadGoals);
  const [view, setView] = useState<'list' | 'create' | 'dashboard'>('list');
  const [activeGoalId, setActiveGoalId] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(goals));
  }, [goals]);

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
      <header className="sticky top-0 z-50 border-b border-zinc-800/60 bg-gradient-to-b from-zinc-950 to-zinc-950/90 backdrop-blur-xl transition-all duration-300">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setView('list')}>
            <div className="relative">
              <Flame className="w-8 h-8 text-phoenix-500 fill-current group-hover:scale-110 transition-transform duration-300" />
              <div className="absolute inset-0 bg-phoenix-500/30 rounded-full blur-lg group-hover:blur-xl transition-all duration-300 -z-10"></div>
            </div>
            <div className="flex flex-col group-hover:translate-x-1 transition-transform duration-300">
              <span className="text-xl font-bold tracking-tight text-white leading-none">Fênix Goals</span>
              <span className="text-[10px] font-mono text-phoenix-400/80 uppercase tracking-widest leading-tight mt-1 flex items-center gap-1">
                <Zap className="w-3 h-3" /> Potencial Infinito
              </span>
            </div>
          </div>
          
          <button onClick={() => setView('create')} className="px-6 py-2.5 rounded-full bg-gradient-to-r from-phoenix-600 to-phoenix-500 hover:from-phoenix-500 hover:to-phoenix-400 text-white text-xs font-bold transition-all duration-300 active:scale-95 shadow-lg shadow-phoenix-900/30 hover:shadow-phoenix-900/50 flex items-center gap-2 group">
            <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" /> NOVO OBJETIVO
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        {view === 'list' && (
          <div className="space-y-16">
            <div className="max-w-3xl">
              <div className="flex items-center gap-3 mb-4">
                <Heart className="w-6 h-6 text-phoenix-500 fill-phoenix-500" />
                <span className="text-sm font-bold text-phoenix-400 uppercase tracking-widest">Bem-vindo de volta</span>
              </div>
              <h2 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 text-white leading-[0.9]">
                Desperte o seu <span className="bg-gradient-to-r from-phoenix-400 to-phoenix-500 bg-clip-text text-transparent italic">potencial agora </span>.
              </h2>
              <p className="text-zinc-400 text-lg leading-relaxed max-w-2xl font-light">
                Transforme desejos em realidade com clareza absoluta. Sua jornada para alta performance começa aqui.
              </p>
            </div>

            {goals.length === 0 ? (
              <div className="border border-dashed border-zinc-800 hover:border-phoenix-500/30 rounded-3xl p-24 text-center transition-all duration-500 bg-gradient-to-b from-zinc-900/20 to-transparent">
                <div className="relative mb-6">
                  <BookOpen className="w-16 h-16 text-zinc-600 mx-auto" />
                  <Star className="w-8 h-8 text-phoenix-400 absolute top-0 right-1/3 animate-pulse" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Inicie sua primeira jornada</h3>
                <p className="text-zinc-400 text-sm mb-8">Crie um objetivo e comece sua transformação pessoal agora</p>
                <button onClick={() => setView('create')} className="bg-gradient-to-r from-phoenix-600 to-phoenix-500 hover:from-phoenix-500 hover:to-phoenix-400 text-white px-8 py-3 rounded-full font-bold text-sm shadow-lg shadow-phoenix-900/30 hover:shadow-phoenix-900/50 transition-all duration-300 hover:scale-105">
                  Definir Objetivo Primário
                </button>
              </div>
            ) : (
              <div className="space-y-20">
                {activeGoals.length > 0 && (
                  <div className="animate-in fade-in slide-in-from-top-4 duration-700">
                    <h3 className="text-[11px] font-bold text-phoenix-500 uppercase tracking-[0.4em] mb-10 flex items-center gap-3">
                      <Flame className="w-4 h-4 fill-current animate-bounce" /> JORNADAS ATIVAS
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {activeGoals.map((goal, idx) => (
                        <div key={goal.id} onClick={() => handleViewGoal(goal.id)} className="group bg-gradient-to-br from-zinc-900/60 to-zinc-950/40 border border-zinc-800 hover:border-phoenix-500/50 p-8 rounded-2xl cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-phoenix-500/10 hover:-translate-y-1" style={{ animationDelay: `${idx * 100}ms` }}>
                          <div className="flex items-start justify-between mb-4">
                            <h3 className="text-2xl font-bold text-white leading-tight flex-1 group-hover:text-phoenix-300 transition-colors">{goal.titulo}</h3>
                            <Zap className="w-5 h-5 text-phoenix-400/60 group-hover:text-phoenix-400 group-hover:animate-pulse transition-all" />
                          </div>
                          <div className="space-y-4">
                            <div className="flex justify-between text-[10px] font-bold uppercase text-zinc-500">
                              <span>PROGRESSO</span>
                              <span className="text-phoenix-300 bg-phoenix-950/40 px-2 py-1 rounded-full">{goal.status.replace('_', ' ')}</span>
                            </div>
                            <div className="w-full bg-zinc-800/50 h-2 rounded-full overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-phoenix-600 to-phoenix-400 transition-all duration-700 rounded-full" style={{ width: `${(goal.plano_acao.filter(t => t.completed).length / Math.max(goal.plano_acao.length, 1)) * 100}%` }} />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {completedGoals.length > 0 && (
                  <div className="animate-in fade-in slide-in-from-top-4 duration-700 delay-200">
                    <h3 className="text-[11px] font-bold text-emerald-500 uppercase tracking-[0.4em] mb-10 flex items-center gap-3">
                      <Trophy className="w-4 h-4 animate-pulse" /> SALÃO DE CONQUISTAS
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {completedGoals.map((goal, idx) => (
                        <div key={goal.id} onClick={() => handleViewGoal(goal.id)} className="group bg-gradient-to-br from-emerald-950/40 to-zinc-950/40 border border-emerald-900/40 hover:border-emerald-500/60 p-8 rounded-2xl cursor-pointer hover:shadow-lg hover:shadow-emerald-500/10 hover:-translate-y-1 transition-all duration-300" style={{ animationDelay: `${idx * 100}ms` }}>
                          <div className="flex justify-between items-start mb-4">
                            <h3 className="text-xl font-bold text-emerald-200 group-hover:text-emerald-300 transition-colors">{goal.titulo}</h3>
                            <CheckCircle2 className="w-6 h-6 text-emerald-400 group-hover:scale-110 transition-transform" />
                          </div>
                          <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">✓ Jornada Completada</p>
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

      <footer className="max-w-6xl mx-auto px-6 py-16 border-t border-zinc-900/50 text-center">
        <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.3em] hover:text-zinc-400 transition-colors cursor-pointer">
          Baseado no Seminário Fênix de Brian Tracy • Transformando Sonhos em Realidade
        </p>
      </footer>
    </div>
  );
}
