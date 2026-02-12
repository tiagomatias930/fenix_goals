import React, { useState, useEffect, useMemo } from 'react';
import { Goal, ActionItem } from '../types';
import { 
  ArrowLeft, Clock, AlertTriangle, CheckSquare, Target, Sparkles, 
  Loader2, Trophy, Share2, Check, FileText, Activity, TrendingUp, Flame,
  Heart, Zap, Brain, Calendar, CheckCircle, Lightbulb
} from 'lucide-react';

interface GoalDashboardProps {
  goal: Goal;
  onBack: () => void;
  onUpdate: (goal: Goal) => void;
}

export default function GoalDashboard({ goal, onBack, onUpdate }: GoalDashboardProps) {
  const [timeLeft, setTimeLeft] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (goal.status === 'concluido') return;
    const timer = setInterval(() => {
      const diff = +new Date(goal.data_limite) - +new Date();
      if (diff <= 0) { setTimeLeft("Expirado"); return; }
      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
      setTimeLeft(`${d}d ${h}h`);
    }, 1000);
    return () => clearInterval(timer);
  }, [goal.data_limite, goal.status]);

  const handleGenerateImage = () => {
    setIsGenerating(true);
    const seed = Date.now();
    const imageUrl = `https://picsum.photos/seed/${seed}/800/600`;
    onUpdate({ ...goal, imagem_visualizacao: imageUrl });
    setIsGenerating(false);
  };

  const toggleTask = (id: string) => {
    if (goal.status === 'concluido') return;
    const updated = goal.plano_acao.map(t => t.id === id ? { ...t, completed: !t.completed, completedAt: !t.completed ? Date.now() : undefined } : t);
    onUpdate({ ...goal, plano_acao: updated });
  };

  const completeGoal = () => {
    onUpdate({ ...goal, status: 'concluido', completedAt: Date.now() });
  };

  const dataPoints = useMemo(() => {
    const completedTasks = goal.plano_acao
      .filter(t => t.completed && t.completedAt)
      .sort((a, b) => (a.completedAt || 0) - (b.completedAt || 0));
    const totalTasks = goal.plano_acao.length || 1;
    const startTime = goal.createdAt;
    const endTime = goal.status === 'concluido' ? (goal.completedAt || Date.now()) : Date.now();
    const timeRange = Math.max(endTime - startTime, 1);
    const points = [{ x: 0, y: 100 }];
    completedTasks.forEach((task, index) => {
      const progress = ((index + 1) / totalTasks) * 100;
      const xPercent = ((task.completedAt! - startTime) / timeRange) * 100;
      points.push({ x: xPercent, y: 100 - progress });
    });
    if (points[points.length - 1].x < 100) {
      points.push({ ...points[points.length - 1], x: 100 });
    }
    return points;
  }, [goal]);

  const pathData = dataPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  return (
    <div className="space-y-12 pb-20">
      <div className="flex justify-between items-center no-print animate-in fade-in slide-in-from-top-4 duration-500">
        <button onClick={onBack} className="text-zinc-500 hover:text-white hover:bg-zinc-800/40 px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-bold transition-all duration-300 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> VOLTAR
        </button>
        <div className={`px-5 py-2 rounded-full border text-xs font-bold uppercase tracking-widest transition-all duration-300 ${goal.status === 'concluido' ? 'bg-gradient-to-r from-emerald-950/60 to-transparent border-emerald-500/40 text-emerald-400 shadow-lg shadow-emerald-500/20' : 'bg-gradient-to-r from-phoenix-950/60 to-transparent border-phoenix-500/40 text-phoenix-400 shadow-lg shadow-phoenix-500/20'}`}>
          ✓ {goal.status.replace('_', ' ')}
        </div>
      </div>

      <div className="relative p-12 rounded-3xl bg-gradient-to-br from-zinc-900/60 to-zinc-950/40 border border-zinc-800/60 overflow-hidden no-print animate-in fade-in slide-in-from-top-4 duration-700" style={{ animationDelay: '100ms' }}>
        <div className="absolute inset-0 opacity-2 bg-center bg-cover" style={{ backgroundImage: `url(${goal.imagem_visualizacao || ''})` }} />
        <div className="absolute inset-0 bg-gradient-to-br from-phoenix-500/5 to-transparent pointer-events-none"></div>
        <div className="relative flex flex-col md:flex-row justify-between items-end gap-10">
          <div className="flex-1 space-y-6">
            <div className="flex items-center gap-3">
              <Flame className="w-7 h-7 text-phoenix-500 animate-pulse" />
              <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-white leading-none">{goal.titulo}</h1>
            </div>
            <p className="text-zinc-300 text-lg italic border-l-4 border-phoenix-500 pl-4 py-2 bg-phoenix-500/5 rounded-r-lg">{goal.ponto_partida}</p>
          </div>
          <div className="text-right space-y-4 flex-shrink-0">
            {goal.status !== 'concluido' && (
              <div className="bg-gradient-to-br from-zinc-900/80 to-zinc-950/60 p-5 rounded-xl border border-phoenix-500/30 text-center shadow-lg shadow-phoenix-500/10 hover:shadow-phoenix-500/20 transition-all duration-300">
                <span className="block text-3xl font-bold text-phoenix-300">{timeLeft}</span>
                <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">⏱ Tempo Restante</span>
              </div>
            )}
            <div className="flex gap-2 justify-end">
               <button onClick={handleGenerateImage} disabled={isGenerating} className="p-3 rounded-full bg-zinc-900/40 border border-zinc-800 hover:border-phoenix-500/40 text-zinc-400 hover:text-phoenix-400 transition-all duration-300 hover:bg-zinc-800/40 hover:shadow-lg hover:shadow-phoenix-500/20">
                {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
              </button>
              {goal.status === 'concluido' ? (
                <button onClick={() => window.print()} className="px-6 py-2.5 bg-gradient-to-r from-white to-zinc-50 hover:from-zinc-50 hover:to-white text-zinc-950 rounded-full font-bold text-sm shadow-lg transition-all duration-300 hover:shadow-2xl hover:scale-105">
                  🎓 CERTIFICADO
                </button>
              ) : (
                <button onClick={completeGoal} className="px-6 py-2.5 bg-gradient-to-r from-phoenix-600 to-phoenix-500 hover:from-phoenix-500 hover:to-phoenix-400 text-white rounded-full font-bold text-sm shadow-lg shadow-phoenix-900/40 transition-all duration-300 hover:shadow-phoenix-900/60 hover:scale-105">
                  🔥 FINALIZAR META
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-2xl p-6 animate-in fade-in slide-in-from-top-4 duration-700" style={{ animationDelay: '200ms' }}>
        <h3 className="text-[10px] font-bold text-phoenix-400 uppercase tracking-widest flex items-center gap-2 mb-6">
          <TrendingUp className="w-4 h-4" /> LINHA DO TEMPO DE EVOLUÇÃO
        </h3>
        <div className="relative h-40 w-full">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
            <path d={`${pathData} L 100 100 L 0 100 Z`} fill="rgba(249, 115, 22, 0.08)" />
            <path d={pathData} fill="none" stroke="#f97316" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 no-print animate-in fade-in slide-in-from-top-4 duration-700" style={{ animationDelay: '300ms' }}>
        <div className="lg:col-span-4 space-y-8">
           <div className="bg-gradient-to-br from-zinc-900/60 to-zinc-950/40 border border-zinc-800/60 p-8 rounded-2xl hover:border-phoenix-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-phoenix-500/10">
            <h3 className="text-xs font-bold text-phoenix-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <Heart className="w-4 h-4 animate-pulse" /> MOTIVAÇÃO
            </h3>
            <div className="space-y-4">
              {goal.lista_porques.map((why, i) => (
                <p key={i} className="text-zinc-300 text-sm leading-relaxed border-l-2 border-phoenix-500/40 pl-3 hover:border-phoenix-500 transition-colors">
                  <span className="text-phoenix-400 font-bold mr-2">#{i+1}</span> {why}
                </p>
              ))}
            </div>
          </div>
          <div className="bg-gradient-to-br from-red-950/40 to-red-950/10 border border-red-900/40 p-8 rounded-2xl hover:border-red-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-red-500/10">
            <h3 className="text-xs font-bold text-red-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" /> OBSTÁCULO
            </h3>
            <p className="text-zinc-300 italic font-light leading-relaxed">{goal.obstaculo_principal}</p>
          </div>
        </div>

        <div className="lg:col-span-8 bg-gradient-to-br from-zinc-900/60 to-zinc-950/40 border border-zinc-800/60 rounded-2xl overflow-hidden hover:border-phoenix-500/30 transition-all duration-300">
          <div className="px-8 py-6 border-b border-zinc-800/60 bg-zinc-950/40 flex justify-between items-center">
            <h3 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-phoenix-500" /> PLANO DE AÇÃO
            </h3>
            <span className="text-[10px] font-bold text-zinc-400 bg-zinc-900/60 px-3 py-1 rounded-full flex items-center gap-1">
              <CheckCircle className="w-3 h-3" /> {goal.plano_acao.filter(t => t.completed).length}/{goal.plano_acao.length}
            </span>
          </div>
          <div className="divide-y divide-zinc-800/40">
            {goal.plano_acao.map((task) => (
              <div key={task.id} onClick={() => toggleTask(task.id)} className="p-6 flex items-center gap-4 hover:bg-zinc-800/20 cursor-pointer group transition-all duration-200 border-l-4 border-l-transparent hover:border-l-phoenix-500/60">
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ${task.completed ? 'bg-gradient-to-br from-phoenix-600 to-phoenix-500 border-phoenix-500 shadow-lg shadow-phoenix-500/40' : 'border-zinc-700 bg-zinc-900/40 group-hover:border-phoenix-500/40'}`}>
                  {task.completed && <Check className="w-3 h-3 text-white" />}
                </div>
                <span className={`flex-1 transition-all text-sm ${task.completed ? 'text-zinc-500 line-through' : 'text-zinc-200 group-hover:text-white'}`}>{task.text}</span>
                {task.completed && <span className="text-xs text-emerald-500 font-bold">✓</span>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
