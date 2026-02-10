
import React, { useState, useEffect, useMemo } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Goal, ActionItem } from '../types';
import { 
  ArrowLeft, Clock, AlertTriangle, CheckSquare, Target, Sparkles, 
  Loader2, Trophy, Share2, Check, FileText, Activity, TrendingUp, Flame
} from 'lucide-react';

interface GoalDashboardProps {
  goal: Goal;
  onBack: () => void;
  onUpdate: (goal: Goal) => void;
}

const ProgressChart = ({ goal }: { goal: Goal }) => {
  const dataPoints = useMemo(() => {
    const completedTasks = goal.plano_acao
      .filter(t => t.completed && t.completedAt)
      .sort((a, b) => (a.completedAt || 0) - (b.completedAt || 0));

    const totalTasks = goal.plano_acao.length || 1;
    const startTime = goal.createdAt;
    const endTime = goal.status === 'concluido' ? (goal.completedAt || Date.now()) : Date.now();
    const timeRange = Math.max(endTime - startTime, 1);

    const points = [{ x: 0, y: 100, date: 'Início', text: 'Jornada Iniciada' }];

    completedTasks.forEach((task, index) => {
      const progress = ((index + 1) / totalTasks) * 100;
      const xPercent = ((task.completedAt! - startTime) / timeRange) * 100;
      points.push({ x: xPercent, y: 100 - progress, date: new Date(task.completedAt!).toLocaleDateString(), text: task.text });
    });

    if (points[points.length - 1].x < 100) {
      points.push({ ...points[points.length - 1], x: 100 });
    }

    return points;
  }, [goal]);

  const pathData = dataPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
      <h3 className="text-[10px] font-bold text-phoenix-500 uppercase tracking-widest flex items-center gap-2 mb-6">
        <TrendingUp className="w-4 h-4" /> LINHA DO TEMPO DE EVOLUÇÃO
      </h3>
      <div className="relative h-40 w-full">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
          <path d={`${pathData} L 100 100 L 0 100 Z`} fill="rgba(249, 115, 22, 0.1)" />
          <path d={pathData} fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
};

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

  const handleGenerateImage = async () => {
    if (!process.env.API_KEY) return;
    setIsGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Futuristic visionary art representing the achievement of: ${goal.titulo}. High quality, cinematic lighting, phoenix theme.`;
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: prompt }] }
      });
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          onUpdate({ ...goal, imagem_visualizacao: `data:image/png;base64,${part.inlineData.data}` });
          break;
        }
      }
    } catch (e) { console.error(e); } finally { setIsGenerating(false); }
  };

  const toggleTask = (id: string) => {
    if (goal.status === 'concluido') return;
    const updated = goal.plano_acao.map(t => t.id === id ? { ...t, completed: !t.completed, completedAt: !t.completed ? Date.now() : undefined } : t);
    onUpdate({ ...goal, plano_acao: updated });
  };

  const completeGoal = () => {
    onUpdate({ ...goal, status: 'concluido', completedAt: Date.now() });
  };

  return (
    <div className="space-y-12 pb-20">
      <div className="flex justify-between items-center no-print">
        <button onClick={onBack} className="text-zinc-500 hover:text-white flex items-center gap-2 text-sm font-bold">
          <ArrowLeft className="w-4 h-4" /> VOLTAR
        </button>
        <div className={`px-4 py-1.5 rounded-full border text-[10px] font-bold uppercase tracking-widest ${goal.status === 'concluido' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' : 'bg-phoenix-500/10 border-phoenix-500/30 text-phoenix-500'}`}>
          STATUS: {goal.status.replace('_', ' ')}
        </div>
      </div>

      <div className="relative p-12 rounded-3xl bg-zinc-900/40 border border-zinc-800 overflow-hidden no-print">
        <div className="absolute inset-0 opacity-10 bg-center bg-cover" style={{ backgroundImage: `url(${goal.imagem_visualizacao || ''})` }} />
        <div className="relative flex flex-col md:flex-row justify-between items-end gap-10">
          <div className="flex-1 space-y-6">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-white leading-none">{goal.titulo}</h1>
            <p className="text-zinc-400 text-lg italic border-l-2 border-phoenix-500 pl-4">{goal.ponto_partida}</p>
          </div>
          <div className="text-right space-y-4">
            {goal.status !== 'concluido' && (
              <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 text-center">
                <span className="block text-3xl font-bold text-white">{timeLeft}</span>
                <span className="text-[10px] text-zinc-500 uppercase font-bold">Tempo Restante</span>
              </div>
            )}
            <div className="flex gap-2">
               <button onClick={handleGenerateImage} disabled={isGenerating} className="p-3 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-phoenix-400 transition-all">
                {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
              </button>
              {goal.status === 'concluido' ? (
                <button onClick={() => window.print()} className="px-6 py-2.5 bg-white text-zinc-950 rounded-full font-bold text-sm">CERTIFICADO</button>
              ) : (
                <button onClick={completeGoal} className="px-6 py-2.5 bg-phoenix-600 text-white rounded-full font-bold text-sm shadow-lg shadow-phoenix-900/30">FINALIZAR META</button>
              )}
            </div>
          </div>
        </div>
      </div>

      <ProgressChart goal={goal} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 no-print">
        <div className="lg:col-span-4 space-y-8">
           <div className="bg-zinc-900/40 border border-zinc-800 p-8 rounded-2xl">
            <h3 className="text-xs font-bold text-phoenix-500 uppercase tracking-widest mb-6 flex items-center gap-2"><Target className="w-4 h-4" /> MOTIVAÇÃO</h3>
            <div className="space-y-4">
              {goal.lista_porques.map((why, i) => (
                <p key={i} className="text-zinc-300 text-sm leading-relaxed"><span className="text-phoenix-500/50 mr-2">#{i+1}</span> {why}</p>
              ))}
            </div>
          </div>
          <div className="bg-red-950/10 border border-red-900/20 p-8 rounded-2xl">
            <h3 className="text-xs font-bold text-red-500 uppercase tracking-widest mb-4 flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> OBSTÁCULO</h3>
            <p className="text-zinc-400 italic font-light">{goal.obstaculo_principal}</p>
          </div>
        </div>

        <div className="lg:col-span-8 bg-zinc-900/40 border border-zinc-800 rounded-2xl overflow-hidden">
          <div className="px-8 py-6 border-b border-zinc-800 bg-zinc-950/30 flex justify-between items-center">
            <h3 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2"><CheckSquare className="w-4 h-4 text-phoenix-500" /> PLANO DE AÇÃO</h3>
            <span className="text-[10px] font-bold text-zinc-500">{goal.plano_acao.filter(t => t.completed).length}/{goal.plano_acao.length} TAREFAS</span>
          </div>
          <div className="divide-y divide-zinc-800/50">
            {goal.plano_acao.map((task) => (
              <div key={task.id} onClick={() => toggleTask(task.id)} className="p-6 flex items-center gap-4 hover:bg-zinc-800/20 cursor-pointer group">
                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${task.completed ? 'bg-phoenix-500 border-phoenix-500' : 'border-zinc-700 bg-zinc-900'}`}>
                  {task.completed && <Check className="w-3 h-3 text-white" />}
                </div>
                <span className={`flex-1 transition-all ${task.completed ? 'text-zinc-600 line-through' : 'text-zinc-200 group-hover:text-white'}`}>{task.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
