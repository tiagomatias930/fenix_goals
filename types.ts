
export interface ActionItem {
  id: string;
  text: string;
  completed: boolean;
  completedAt?: number;
}

export interface Goal {
  id: string;
  // Campos solicitados
  titulo: string;
  desejo_intensidade: number; // 1-10
  data_limite: string; // ISO string
  hora_limite: string; // HH:mm
  status: 'em_andamento' | 'concluido';
  
  // Campos da Metodologia Fênix (12 Passos)
  status_escrita: boolean;
  lista_porques: string[];
  ponto_partida: string;
  obstaculo_principal: string;
  habilidades_necessarias: string;
  parceiros_chave: string;
  plano_acao: ActionItem[];
  imagem_visualizacao?: string;
  
  // Metadados
  completedAt?: number;
  createdAt: number;
}
