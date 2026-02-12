
import React, { useState } from 'react';
import { Goal, ActionItem } from '../types';
import { ChevronRight, ChevronLeft, Check, Target, Calendar, Rocket } from 'lucide-react';

interface GoalWizardProps {
  onSave: (goal: Goal) => void;
  onCancel: () => void;
}

enum WizardPhase {
  DESIRE_BELIEF = 0,
  CRYSTALLIZE = 1,
  MOTIVATION = 2,
  CONSTRAINTS = 3,
  RESOURCES = 4,
  PLANNING = 5,
  VISUALIZATION = 6
}

export default function GoalWizard({ onSave, onCancel }: GoalWizardProps) {
  const [phase, setPhase] = useState<WizardPhase>(WizardPhase.DESIRE_BELIEF);
  
  const [titulo, setTitulo] = useState('');
  const [intensidade, setIntensidade] = useState(5);
  const [statusEscrita, setStatusEscrita] = useState(false);
  const [pontoPartida, setPontoPartida] = useState('');
  const [tempPorque, setTempPorque] = useState('');
  const [listaPorques, setListaPorques] = useState<string[]>([]);
  const [dataLimite, setDataLimite] = useState('');
  const [obstaculo, setObstaculo] = useState('');
  const [habilidades, setHabilidades] = useState('');
  const [parceiros, setParceiros] = useState('');
  const [tempTarefa, setTempTarefa] = useState('');
  const [planoAcao, setPlanoAcao] = useState<ActionItem[]>([]);

  const canProceed = () => {
    switch (phase) {
      case WizardPhase.DESIRE_BELIEF: return titulo.length > 5;
      case WizardPhase.CRYSTALLIZE: return statusEscrita && pontoPartida.length > 10;
      case WizardPhase.MOTIVATION: return listaPorques.length >= 3;
      case WizardPhase.CONSTRAINTS: return dataLimite !== '' && obstaculo.length > 5;
      case WizardPhase.RESOURCES: return habilidades.length > 3;
      case WizardPhase.PLANNING: return planoAcao.length > 0;
      case WizardPhase.VISUALIZATION: return true;
      default: return false;
    }
  };

  const handleNext = () => {
    if (canProceed() && phase < WizardPhase.VISUALIZATION) {
      setPhase(phase + 1);
    } else if (phase === WizardPhase.VISUALIZATION) {
      const seed = Date.now();
      const newGoal: Goal = {
        id: crypto.randomUUID(),
        titulo,
        desejo_intensidade: intensidade,
        status: 'em_andamento', // Status inicial
        status_escrita: statusEscrita,
        ponto_partida: pontoPartida,
        lista_porques: listaPorques,
        data_limite: dataLimite,
        obstaculo_principal: obstaculo,
        habilidades_necessarias: habilidades,
        parceiros_chave: parceiros,
        plano_acao: planoAcao,
        imagem_visualizacao: `https://picsum.photos/seed/${seed}/800/600`,
        createdAt: Date.now()
      };
      onSave(newGoal);
    }
  };

  const inputClass = "w-full bg-zinc-950 border border-zinc-800 rounded-md px-4 py-2.5 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-phoenix-500 focus:border-phoenix-500 transition-all";
  const labelClass = "block text-[11px] font-mono font-bold text-zinc-500 uppercase tracking-wider mb-2";

  return (
    <div className="max-w-2xl mx-auto border border-zinc-800 bg-zinc-900/50 rounded-xl shadow-2xl overflow-hidden">
      <div className="bg-zinc-950 px-8 py-4 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-phoenix-500 animate-pulse"></div>
          <span className="text-[10px] font-mono text-zinc-400 uppercase">Passo {phase + 1} de 7</span>
        </div>
        <div className="flex gap-1">
          {[...Array(7)].map((_, i) => (
            <div key={i} className={`h-1 w-4 rounded-full transition-all duration-500 ${i <= phase ? 'bg-phoenix-500' : 'bg-zinc-800'}`} />
          ))}
        </div>
      </div>

      <div className="p-10 space-y-8">
        {phase === WizardPhase.DESIRE_BELIEF && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">O Desejo Ardente</h2>
            <div>
              <label className={labelClass}>O que exatamente você quer atingir?</label>
              <input type="text" value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Ex: Masterizar Desenvolvimento Mobile em 6 meses" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Intensidade do Desejo: {intensidade}/10</label>
              <input type="range" min="1" max="10" value={intensidade} onChange={(e) => setIntensidade(Number(e.target.value))} className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-phoenix-500" />
            </div>
          </div>
        )}

        {phase === WizardPhase.CRYSTALLIZE && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Cristalização</h2>
            <div className="bg-zinc-950 p-4 rounded-md border border-zinc-800">
              <label className="flex items-center gap-3 cursor-pointer">
                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${statusEscrita ? 'bg-phoenix-500 border-phoenix-500' : 'border-zinc-700 bg-zinc-900'}`}>
                  {statusEscrita && <Check className="w-3 h-3 text-white" />}
                </div>
                <input type="checkbox" className="hidden" checked={statusEscrita} onChange={(e) => setStatusEscrita(e.target.checked)} />
                <span className="text-sm text-zinc-300">Eu escrevi este objetivo em papel físico.</span>
              </label>
            </div>
            <div>
              <label className={labelClass}>Onde você está agora?</label>
              <textarea value={pontoPartida} onChange={(e) => setPontoPartida(e.target.value)} placeholder="Seja brutalmente honesto sobre sua situação atual..." className={inputClass + " h-32 resize-none"} />
            </div>
          </div>
        )}

        {phase === WizardPhase.MOTIVATION && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">O Combustível</h2>
            <div className="flex gap-2">
              <input type="text" value={tempPorque} onChange={(e) => setTempPorque(e.target.value)} placeholder="Por que isso é importante?" className={inputClass} />
              <button onClick={() => { if(tempPorque.trim()) { setListaPorques([...listaPorques, tempPorque.trim()]); setTempPorque(''); } }} className="px-4 bg-zinc-800 rounded-md text-xs font-bold uppercase">ADD</button>
            </div>
            <div className="space-y-2">
              {listaPorques.map((p, idx) => (
                <div key={idx} className="p-3 bg-zinc-950 border border-zinc-800 rounded-md text-sm text-zinc-400">
                  <span className="text-phoenix-500 mr-2">#{idx+1}</span> {p}
                </div>
              ))}
            </div>
          </div>
        )}

        {phase === WizardPhase.CONSTRAINTS && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Prazos e Limitações</h2>
            <div>
              <label className={labelClass}>Data Limite</label>
              <input type="date" value={dataLimite} onChange={(e) => setDataLimite(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Obstáculo Principal (O Gargalo)</label>
              <textarea value={obstaculo} onChange={(e) => setObstaculo(e.target.value)} placeholder="O que te impede hoje?" className={inputClass + " h-24 resize-none"} />
            </div>
          </div>
        )}

        {phase === WizardPhase.RESOURCES && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Recursos e Alianças</h2>
            <div>
              <label className={labelClass}>Habilidades a Desenvolver</label>
              <input type="text" value={habilidades} onChange={(e) => setHabilidades(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Quem pode te ajudar?</label>
              <input type="text" value={parceiros} onChange={(e) => setParceiros(e.target.value)} className={inputClass} />
            </div>
          </div>
        )}

        {phase === WizardPhase.PLANNING && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Plano de Ação</h2>
            <div className="flex gap-2">
              <input type="text" value={tempTarefa} onChange={(e) => setTempTarefa(e.target.value)} placeholder="Adicionar tarefa..." className={inputClass} />
              <button onClick={() => { if(tempTarefa.trim()) { setPlanoAcao([...planoAcao, { id: crypto.randomUUID(), text: tempTarefa.trim(), completed: false }]); setTempTarefa(''); } }} className="px-4 bg-zinc-800 rounded-md text-xs font-bold uppercase">PUSH</button>
            </div>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {planoAcao.map((t, i) => (
                <div key={t.id} className="p-3 bg-zinc-950 border border-zinc-800 rounded-md text-sm text-zinc-300">
                   [{i+1}] {t.text}
                </div>
              ))}
            </div>
          </div>
        )}

        {phase === WizardPhase.VISUALIZATION && (
          <div className="text-center py-6 space-y-6">
            <Rocket className="w-16 h-16 text-phoenix-500 mx-auto" />
            <h3 className="text-xl font-bold">Confirmar Compromisso</h3>
            <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-lg text-left">
              <p className="text-lg font-bold">"{titulo}"</p>
              <div className="mt-2 flex gap-4 text-xs text-zinc-500">
                <span>📅 {dataLimite}</span>
                <span className="text-phoenix-500">🔥 INTENSIDADE {intensidade}</span>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between pt-6 border-t border-zinc-800">
          <button onClick={phase === 0 ? onCancel : () => setPhase(phase - 1)} className="px-4 py-2 text-zinc-500 hover:text-white transition-colors">
            {phase === 0 ? 'Cancelar' : 'Voltar'}
          </button>
          <button onClick={handleNext} disabled={!canProceed()} className={`px-8 py-2 rounded-md font-bold transition-all ${canProceed() ? 'bg-white text-zinc-950' : 'bg-zinc-800 text-zinc-600'}`}>
            {phase === WizardPhase.VISUALIZATION ? 'Iniciar Jornada' : 'Próximo'}
          </button>
        </div>
      </div>
    </div>
  );
}
