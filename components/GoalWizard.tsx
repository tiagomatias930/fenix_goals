
import React, { useState } from 'react';
import { Goal, ActionItem } from '../types';
import {
  Box, Card, CardContent, Typography, TextField, Button, Slider, Checkbox,
  FormControlLabel, Stepper, Step, StepLabel, Stack, Chip, IconButton,
  Paper, Fade, List, ListItem, ListItemText, ListItemIcon
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import CheckIcon from '@mui/icons-material/Check';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import TagIcon from '@mui/icons-material/Tag';
import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck';

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

const phaseLabels = [
  'Desejo',
  'Cristalizar',
  'Motivação',
  'Prazos',
  'Recursos',
  'Plano',
  'Confirmar'
];

export default function GoalWizard({ onSave, onCancel }: GoalWizardProps) {
  const [phase, setPhase] = useState<WizardPhase>(WizardPhase.DESIRE_BELIEF);
  
  const [titulo, setTitulo] = useState('');
  const [intensidade, setIntensidade] = useState(5);
  const [statusEscrita, setStatusEscrita] = useState(false);
  const [pontoPartida, setPontoPartida] = useState('');
  const [tempPorque, setTempPorque] = useState('');
  const [listaPorques, setListaPorques] = useState<string[]>([]);
  const [dataLimite, setDataLimite] = useState('');
  const [horaLimite, setHoraLimite] = useState('');
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
        status: 'em_andamento',
        status_escrita: statusEscrita,
        ponto_partida: pontoPartida,
        lista_porques: listaPorques,
        data_limite: dataLimite,
        hora_limite: horaLimite,
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

  const handleAddPorque = () => {
    if (tempPorque.trim()) {
      setListaPorques([...listaPorques, tempPorque.trim()]);
      setTempPorque('');
    }
  };

  const handleAddTarefa = () => {
    if (tempTarefa.trim()) {
      setPlanoAcao([...planoAcao, { id: crypto.randomUUID(), text: tempTarefa.trim(), completed: false }]);
      setTempTarefa('');
    }
  };

  return (
    <Card sx={{ maxWidth: 720, mx: 'auto', overflow: 'hidden' }}>
      {/* Stepper Header */}
      <Box sx={{ bgcolor: 'background.default', px: 4, pt: 3, pb: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Stepper activeStep={phase} alternativeLabel>
          {phaseLabels.map((label) => (
            <Step key={label}>
              <StepLabel>
                <Typography variant="caption" sx={{ fontSize: '0.65rem', fontWeight: 600, color: 'text.secondary' }}>
                  {label}
                </Typography>
              </StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>

      {/* Content */}
      <CardContent sx={{ p: 5 }}>
        <Fade in key={phase} timeout={400}>
          <Box>
            {/* Phase 0: Desire */}
            {phase === WizardPhase.DESIRE_BELIEF && (
              <Stack spacing={4}>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>O Desejo Ardente</Typography>
                  <Typography variant="body2" color="text.secondary">Defina com clareza o que você quer conquistar.</Typography>
                </Box>
                <TextField
                  label="O que exatamente você quer atingir?"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder="Ex: Masterizar Desenvolvimento Mobile em 6 meses"
                  fullWidth
                  variant="outlined"
                />
                <Box>
                  <Typography variant="overline" sx={{ color: 'text.secondary', fontSize: '0.65rem' }}>
                    Intensidade do Desejo: <Box component="span" sx={{ color: 'primary.main', fontWeight: 800 }}>{intensidade}/10</Box>
                  </Typography>
                  <Slider
                    value={intensidade}
                    onChange={(_, val) => setIntensidade(val as number)}
                    min={1}
                    max={10}
                    step={1}
                    marks
                    valueLabelDisplay="auto"
                    sx={{ mt: 1 }}
                  />
                </Box>
              </Stack>
            )}

            {/* Phase 1: Crystallize */}
            {phase === WizardPhase.CRYSTALLIZE && (
              <Stack spacing={4}>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>Cristalização</Typography>
                  <Typography variant="body2" color="text.secondary">Torne seu objetivo tangível e real.</Typography>
                </Box>
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, bgcolor: alpha('#f97316', 0.03) }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={statusEscrita}
                        onChange={(e) => setStatusEscrita(e.target.checked)}
                      />
                    }
                    label={
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        Eu escrevi este objetivo em papel físico.
                      </Typography>
                    }
                  />
                </Paper>
                <TextField
                  label="Onde você está agora?"
                  value={pontoPartida}
                  onChange={(e) => setPontoPartida(e.target.value)}
                  placeholder="Seja brutalmente honesto sobre sua situação atual..."
                  fullWidth
                  multiline
                  rows={4}
                  variant="outlined"
                />
              </Stack>
            )}

            {/* Phase 2: Motivation */}
            {phase === WizardPhase.MOTIVATION && (
              <Stack spacing={4}>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>O Combustível</Typography>
                  <Typography variant="body2" color="text.secondary">Liste pelo menos 3 razões poderosas. ({listaPorques.length}/3 mínimo)</Typography>
                </Box>
                <Stack direction="row" spacing={1}>
                  <TextField
                    value={tempPorque}
                    onChange={(e) => setTempPorque(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddPorque()}
                    placeholder="Por que isso é importante?"
                    fullWidth
                    size="small"
                    variant="outlined"
                  />
                  <Button variant="contained" onClick={handleAddPorque} sx={{ minWidth: 48, px: 2 }}>
                    <AddIcon />
                  </Button>
                </Stack>
                <Stack spacing={1.5}>
                  {listaPorques.map((p, idx) => (
                    <Paper key={idx} variant="outlined" sx={{ p: 2, borderRadius: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Chip label={`#${idx + 1}`} size="small" color="primary" sx={{ fontWeight: 700, minWidth: 36 }} />
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>{p}</Typography>
                    </Paper>
                  ))}
                </Stack>
              </Stack>
            )}

            {/* Phase 3: Constraints */}
            {phase === WizardPhase.CONSTRAINTS && (
              <Stack spacing={4}>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>Prazos e Limitações</Typography>
                  <Typography variant="body2" color="text.secondary">Defina um deadline e identifique o maior obstáculo.</Typography>
                </Box>
                <Stack direction="row" spacing={2}>
                  <TextField
                    label="Data Limite"
                    type="date"
                    value={dataLimite}
                    onChange={(e) => setDataLimite(e.target.value)}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    variant="outlined"
                  />
                  <TextField
                    label="Hora Limite"
                    type="time"
                    value={horaLimite}
                    onChange={(e) => setHoraLimite(e.target.value)}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    variant="outlined"
                  />
                </Stack>
                <TextField
                  label="Obstáculo Principal (O Gargalo)"
                  value={obstaculo}
                  onChange={(e) => setObstaculo(e.target.value)}
                  placeholder="O que te impede hoje?"
                  fullWidth
                  multiline
                  rows={3}
                  variant="outlined"
                />
              </Stack>
            )}

            {/* Phase 4: Resources */}
            {phase === WizardPhase.RESOURCES && (
              <Stack spacing={4}>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>Recursos e Alianças</Typography>
                  <Typography variant="body2" color="text.secondary">O que você precisa aprender e quem pode ajudar?</Typography>
                </Box>
                <TextField
                  label="Habilidades a Desenvolver"
                  value={habilidades}
                  onChange={(e) => setHabilidades(e.target.value)}
                  fullWidth
                  variant="outlined"
                />
                <TextField
                  label="Quem pode te ajudar?"
                  value={parceiros}
                  onChange={(e) => setParceiros(e.target.value)}
                  fullWidth
                  variant="outlined"
                />
              </Stack>
            )}

            {/* Phase 5: Planning */}
            {phase === WizardPhase.PLANNING && (
              <Stack spacing={4}>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>Plano de Ação</Typography>
                  <Typography variant="body2" color="text.secondary">Adicione as tarefas concretas para atingir seu objetivo.</Typography>
                </Box>
                <Stack direction="row" spacing={1}>
                  <TextField
                    value={tempTarefa}
                    onChange={(e) => setTempTarefa(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddTarefa()}
                    placeholder="Adicionar tarefa..."
                    fullWidth
                    size="small"
                    variant="outlined"
                  />
                  <Button variant="contained" onClick={handleAddTarefa} sx={{ minWidth: 48, px: 2 }}>
                    <AddIcon />
                  </Button>
                </Stack>
                <Stack spacing={1} sx={{ maxHeight: 200, overflowY: 'auto', pr: 1 }}>
                  {planoAcao.map((t, i) => (
                    <Paper key={t.id} variant="outlined" sx={{ p: 2, borderRadius: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <PlaylistAddCheckIcon sx={{ fontSize: 18, color: 'primary.main' }} />
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        <Box component="span" sx={{ fontWeight: 700, color: 'text.primary', mr: 1 }}>[{i + 1}]</Box>
                        {t.text}
                      </Typography>
                    </Paper>
                  ))}
                </Stack>
              </Stack>
            )}

            {/* Phase 6: Visualization */}
            {phase === WizardPhase.VISUALIZATION && (
              <Stack spacing={4} alignItems="center" sx={{ py: 2 }}>
                <RocketLaunchIcon sx={{ fontSize: 64, color: 'primary.main', filter: 'drop-shadow(0 0 16px rgba(249,115,22,0.3))' }} />
                <Typography variant="h5" sx={{ fontWeight: 700 }}>Confirmar Compromisso</Typography>
                <Paper
                  variant="outlined"
                  sx={{ p: 3, borderRadius: 3, width: '100%', bgcolor: alpha('#f97316', 0.03) }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                    "{titulo}"
                  </Typography>
                  <Stack direction="row" spacing={3} sx={{ mt: 1 }}>
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <CalendarMonthIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="caption" color="text.secondary">
                        {dataLimite}{horaLimite ? ` às ${horaLimite}` : ''}
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <WhatshotIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                      <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 700 }}>
                        INTENSIDADE {intensidade}
                      </Typography>
                    </Stack>
                  </Stack>
                </Paper>
              </Stack>
            )}
          </Box>
        </Fade>

        {/* Navigation */}
        <Stack direction="row" justifyContent="space-between" sx={{ mt: 5, pt: 3, borderTop: '1px solid', borderColor: 'divider' }}>
          <Button
            variant="text"
            startIcon={phase > 0 ? <ArrowBackIcon /> : undefined}
            onClick={phase === 0 ? onCancel : () => setPhase(phase - 1)}
            sx={{ color: 'text.secondary' }}
          >
            {phase === 0 ? 'Cancelar' : 'Voltar'}
          </Button>
          <Button
            variant="contained"
            endIcon={phase < WizardPhase.VISUALIZATION ? <ArrowForwardIcon /> : <RocketLaunchIcon />}
            onClick={handleNext}
            disabled={!canProceed()}
          >
            {phase === WizardPhase.VISUALIZATION ? 'Iniciar Jornada' : 'Próximo'}
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}
