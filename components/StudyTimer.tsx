import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box, Typography, Card, CardContent, Stack, Button, IconButton,
  Paper, CircularProgress, Chip, Dialog, DialogContent, DialogActions,
  Slider, Fade, Collapse
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import StopIcon from '@mui/icons-material/Stop';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import TimerIcon from '@mui/icons-material/Timer';
import SelfImprovementIcon from '@mui/icons-material/SelfImprovement';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import BoltIcon from '@mui/icons-material/Bolt';
import PsychologyIcon from '@mui/icons-material/Psychology';
import CoffeeIcon from '@mui/icons-material/Coffee';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import SettingsIcon from '@mui/icons-material/Settings';

// ──────────────────────────────────────────────────────
// Método Eslen Delanogare (Neurociência do Aprendizado)
// ──────────────────────────────────────────────────────
// Ciclo 1-3: 25 min estudo → 5 min descanso
// Ciclo 4:   25 min estudo → 15-30 min descanso longo
// Baseado no princípio de consolidação neural e atenção sustentada
// ──────────────────────────────────────────────────────

const DELANOGARE_DEFAULTS = {
  studyMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 20,
  cyclesBeforeLongBreak: 4,
};

// Frases motivacionais de Brian Tracy — Jornada Fênix
const BRIAN_TRACY_QUOTES = [
  "A chave para o sucesso é focar a mente naquilo que desejamos, não no que tememos.",
  "Você se torna aquilo em que pensa a maior parte do tempo.",
  "Toda grande conquista foi em algum momento considerada impossível.",
  "O sucesso é previsível. O fracasso também.",
  "Nunca é tarde demais para definir um novo objetivo ou sonhar um novo sonho.",
  "Sua maior responsabilidade é tornar-se tudo o que é capaz de ser.",
  "A ação é a chave fundamental para todo sucesso.",
  "Desenvolva uma atitude de gratidão. Diga obrigado a todos que encontrar por tudo que fizerem por você.",
  "Pessoas de sucesso estão sempre procurando oportunidades para ajudar os outros.",
  "O caminho para o sucesso está na estrada da determinação e persistência.",
  "Seja corajoso. Tome a decisão de buscar seus objetivos com tudo o que tem.",
  "Invista no conhecimento. Quanto mais você aprende, mais você ganha.",
  "Disciplina é a ponte entre metas e realizações.",
  "O hábito de definir prioridades claras e trabalhar nelas é essencial para o sucesso.",
  "Imagine a pessoa que você gostaria de ser — e depois seja ela.",
  "O futuro pertence àqueles que acreditam na beleza dos seus sonhos.",
  "Comprometimento total é o primeiro passo para qualquer conquista.",
  "Seu potencial é ilimitado. Não existem limites para o que você pode realizar.",
];

function getRandomQuote(): string {
  return BRIAN_TRACY_QUOTES[Math.floor(Math.random() * BRIAN_TRACY_QUOTES.length)];
}

type TimerPhase = 'idle' | 'study' | 'short_break' | 'long_break';

function requestNotificationPermission() {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }
}

function sendNotification(title: string, body: string, icon?: string) {
  if ('Notification' in window && Notification.permission === 'granted') {
    const notification = new Notification(title, {
      body,
      icon: icon || '🔥',
      badge: '🔥',
      tag: 'fenix-study-timer',
      requireInteraction: true,
    });
    notification.onclick = () => {
      window.focus();
      notification.close();
    };
  }
}

function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

interface StudyTimerProps {
  goalTitle: string;
}

export default function StudyTimer({ goalTitle }: StudyTimerProps) {
  const [phase, setPhase] = useState<TimerPhase>('idle');
  const [secondsLeft, setSecondsLeft] = useState(DELANOGARE_DEFAULTS.studyMinutes * 60);
  const [totalSeconds, setTotalSeconds] = useState(DELANOGARE_DEFAULTS.studyMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [currentCycle, setCurrentCycle] = useState(1);
  const [totalCyclesCompleted, setTotalCyclesCompleted] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showReturnDialog, setShowReturnDialog] = useState(false);
  const [returnQuote, setReturnQuote] = useState('');

  // Settings
  const [studyMin, setStudyMin] = useState(DELANOGARE_DEFAULTS.studyMinutes);
  const [shortBreakMin, setShortBreakMin] = useState(DELANOGARE_DEFAULTS.shortBreakMinutes);
  const [longBreakMin, setLongBreakMin] = useState(DELANOGARE_DEFAULTS.longBreakMinutes);
  const [cyclesBeforeLong, setCyclesBeforeLong] = useState(DELANOGARE_DEFAULTS.cyclesBeforeLongBreak);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Request notification permission on mount
  useEffect(() => {
    requestNotificationPermission();
  }, []);

  // Play a soft notification sound (Web Audio API)
  const playNotificationSound = useCallback(() => {
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.2);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 1.2);
      // Second note
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.frequency.setValueAtTime(880, ctx.currentTime + 0.15); // A5
      osc2.type = 'sine';
      gain2.gain.setValueAtTime(0.25, ctx.currentTime + 0.15);
      gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.5);
      osc2.start(ctx.currentTime + 0.15);
      osc2.stop(ctx.currentTime + 1.5);
    } catch { /* Audio not supported */ }
  }, []);

  // Timer logic
  useEffect(() => {
    if (!isRunning || phase === 'idle') return;

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handlePhaseComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, phase]);

  const handlePhaseComplete = useCallback(() => {
    setIsRunning(false);
    playNotificationSound();

    if (phase === 'study') {
      // Study session ended → time to rest
      const isLongBreak = currentCycle % cyclesBeforeLong === 0;
      const breakMinutes = isLongBreak ? longBreakMin : shortBreakMin;
      const breakType = isLongBreak ? 'long_break' : 'short_break';

      setTotalCyclesCompleted(prev => prev + 1);

      sendNotification(
        '🧠 Hora de Descansar — Método Delanogare',
        isLongBreak
          ? `Excelente! Você completou ${cyclesBeforeLong} ciclos. Seu cérebro precisa de ${breakMinutes} minutos para consolidar o aprendizado. Levante, hidrate-se e respire.`
          : `Ciclo ${currentCycle} concluído! Descanse ${breakMinutes} minutos. Seu cérebro está consolidando as conexões neurais do que você aprendeu.`
      );

      setPhase(breakType);
      const breakSeconds = breakMinutes * 60;
      setSecondsLeft(breakSeconds);
      setTotalSeconds(breakSeconds);
      setIsRunning(true); // Auto-start break timer
    } else {
      // Break ended → time to return
      const quote = getRandomQuote();
      setReturnQuote(quote);
      setShowReturnDialog(true);

      sendNotification(
        '🔥 Fênix Goals — Hora de Voltar!',
        `"${quote}" — Brian Tracy. Seu descanso terminou. Volte ao objetivo: ${goalTitle}`
      );

      if (phase === 'long_break') {
        setCurrentCycle(1);
      } else {
        setCurrentCycle(prev => prev + 1);
      }
      
      setPhase('idle');
      setSecondsLeft(studyMin * 60);
      setTotalSeconds(studyMin * 60);
    }
  }, [phase, currentCycle, cyclesBeforeLong, longBreakMin, shortBreakMin, studyMin, goalTitle, playNotificationSound]);

  // Overwrite the effect to use the latest handlePhaseComplete
  useEffect(() => {
    if (!isRunning || phase === 'idle') return;

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          // Directly call the phase transition
          setTimeout(() => handlePhaseComplete(), 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, phase, handlePhaseComplete]);

  const startStudy = () => {
    setPhase('study');
    const secs = studyMin * 60;
    setSecondsLeft(secs);
    setTotalSeconds(secs);
    setIsRunning(true);
    setExpanded(true);
  };

  const togglePause = () => {
    setIsRunning(prev => !prev);
  };

  const stopTimer = () => {
    setIsRunning(false);
    setPhase('idle');
    setSecondsLeft(studyMin * 60);
    setTotalSeconds(studyMin * 60);
    setCurrentCycle(1);
  };

  const progressPercent = totalSeconds > 0 ? ((totalSeconds - secondsLeft) / totalSeconds) * 100 : 0;

  const phaseLabel = {
    idle: 'Pronto para Focar',
    study: `Ciclo ${currentCycle} — Foco Profundo`,
    short_break: 'Pausa Curta — Consolidação Neural',
    long_break: 'Pausa Longa — Restauração Cerebral',
  }[phase];

  const phaseColor = {
    idle: '#71717a',
    study: '#f97316',
    short_break: '#10b981',
    long_break: '#3b82f6',
  }[phase];

  return (
    <>
      <Card sx={{ overflow: 'hidden', border: '1px solid', borderColor: phase !== 'idle' ? alpha(phaseColor, 0.3) : 'divider' }}>
        {/* Header — always visible */}
        <Box
          onClick={() => setExpanded(!expanded)}
          sx={{
            px: 3, py: 2, cursor: 'pointer',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            bgcolor: alpha(phaseColor, 0.04),
            borderBottom: expanded ? '1px solid' : 'none',
            borderColor: 'divider',
            '&:hover': { bgcolor: alpha(phaseColor, 0.08) },
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <PsychologyIcon sx={{ fontSize: 20, color: phaseColor }} />
            <Typography variant="overline" sx={{ color: phaseColor, fontSize: '0.65rem', fontWeight: 700 }}>
              Cronograma Delanogare
            </Typography>
            {phase !== 'idle' && (
              <Chip
                label={formatTime(secondsLeft)}
                size="small"
                sx={{
                  fontWeight: 800,
                  fontSize: '0.75rem',
                  fontFamily: 'monospace',
                  bgcolor: alpha(phaseColor, 0.12),
                  color: phaseColor,
                  height: 26,
                }}
              />
            )}
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            {totalCyclesCompleted > 0 && (
              <Chip
                icon={<BoltIcon sx={{ fontSize: '14px !important', color: 'primary.main !important' }} />}
                label={`${totalCyclesCompleted} ciclo${totalCyclesCompleted > 1 ? 's' : ''}`}
                size="small"
                variant="outlined"
                sx={{ height: 24, fontSize: '0.6rem', fontWeight: 700 }}
              />
            )}
            {expanded ? <ExpandLessIcon sx={{ color: 'text.secondary' }} /> : <ExpandMoreIcon sx={{ color: 'text.secondary' }} />}
          </Stack>
        </Box>

        {/* Expanded Content */}
        <Collapse in={expanded}>
          <CardContent sx={{ p: 3 }}>
            {/* Timer Display */}
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Box sx={{ position: 'relative', display: 'inline-flex', mb: 2 }}>
                <CircularProgress
                  variant="determinate"
                  value={progressPercent}
                  size={160}
                  thickness={3}
                  sx={{
                    color: phaseColor,
                    '& .MuiCircularProgress-circle': { strokeLinecap: 'round' },
                    filter: phase !== 'idle' ? `drop-shadow(0 0 8px ${alpha(phaseColor, 0.3)})` : 'none',
                  }}
                />
                <CircularProgress
                  variant="determinate"
                  value={100}
                  size={160}
                  thickness={3}
                  sx={{
                    color: alpha(phaseColor, 0.08),
                    position: 'absolute', left: 0, top: 0,
                  }}
                />
                <Box sx={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  {phase === 'study' && <WhatshotIcon sx={{ fontSize: 20, color: 'primary.main', mb: 0.5, opacity: 0.7 }} />}
                  {(phase === 'short_break' || phase === 'long_break') && <SelfImprovementIcon sx={{ fontSize: 20, color: phaseColor, mb: 0.5, opacity: 0.7 }} />}
                  {phase === 'idle' && <TimerIcon sx={{ fontSize: 20, color: 'text.secondary', mb: 0.5, opacity: 0.5 }} />}
                  <Typography variant="h3" sx={{ fontWeight: 800, fontFamily: 'monospace', color: phase === 'idle' ? 'text.secondary' : phaseColor, letterSpacing: '-0.02em' }}>
                    {formatTime(secondsLeft)}
                  </Typography>
                </Box>
              </Box>

              <Typography variant="body2" sx={{ color: phaseColor, fontWeight: 600, mb: 0.5 }}>
                {phaseLabel}
              </Typography>

              {phase !== 'idle' && (
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                  {phase === 'study'
                    ? 'Mantenha o foco total. Elimine distrações.'
                    : phase === 'short_break'
                    ? 'Levante, alongue-se, hidrate-se. Não use telas.'
                    : 'Descanso prolongado. Faça uma caminhada curta ou medite.'
                  }
                </Typography>
              )}
            </Box>

            {/* Controls */}
            <Stack direction="row" spacing={1.5} justifyContent="center" sx={{ mb: 2 }}>
              {phase === 'idle' ? (
                <Button
                  variant="contained"
                  startIcon={<PlayArrowIcon />}
                  onClick={startStudy}
                  sx={{ borderRadius: 8, px: 4, fontWeight: 700 }}
                >
                  Iniciar Foco
                </Button>
              ) : (
                <>
                  <IconButton
                    onClick={togglePause}
                    sx={{
                      border: '2px solid',
                      borderColor: alpha(phaseColor, 0.3),
                      color: phaseColor,
                      '&:hover': { bgcolor: alpha(phaseColor, 0.1) },
                    }}
                  >
                    {isRunning ? <PauseIcon /> : <PlayArrowIcon />}
                  </IconButton>
                  <IconButton
                    onClick={stopTimer}
                    sx={{
                      border: '2px solid',
                      borderColor: alpha('#ef4444', 0.3),
                      color: '#ef4444',
                      '&:hover': { bgcolor: alpha('#ef4444', 0.1) },
                    }}
                  >
                    <StopIcon />
                  </IconButton>
                </>
              )}
              <IconButton
                onClick={() => setShowSettings(!showSettings)}
                sx={{ border: '1px solid', borderColor: 'divider', color: 'text.secondary' }}
              >
                <SettingsIcon fontSize="small" />
              </IconButton>
            </Stack>

            {/* Cycle Indicators */}
            <Stack direction="row" spacing={0.5} justifyContent="center" sx={{ mb: 2 }}>
              {Array.from({ length: cyclesBeforeLong }).map((_, i) => (
                <Box
                  key={i}
                  sx={{
                    width: 28, height: 6, borderRadius: 1,
                    bgcolor: i < (currentCycle - 1 + (phase === 'study' || phase === 'idle' ? 0 : 1))
                      ? 'primary.main'
                      : i === (currentCycle - 1) && phase === 'study'
                      ? alpha('#f97316', 0.4)
                      : alpha('#fff', 0.06),
                    transition: 'all 0.3s',
                  }}
                />
              ))}
              <CoffeeIcon sx={{ fontSize: 14, color: 'text.secondary', ml: 0.5 }} />
            </Stack>

            {/* Settings Panel */}
            <Collapse in={showSettings}>
              <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, mt: 1 }}>
                <Typography variant="overline" sx={{ color: 'text.secondary', fontSize: '0.6rem', mb: 2, display: 'block' }}>
                  Configurações do Método Delanogare
                </Typography>
                <Stack spacing={2.5}>
                  <Box>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="caption" sx={{ fontWeight: 600 }}>Tempo de Foco</Typography>
                      <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 700 }}>{studyMin} min</Typography>
                    </Stack>
                    <Slider
                      value={studyMin}
                      onChange={(_, v) => { setStudyMin(v as number); if (phase === 'idle') { setSecondsLeft((v as number) * 60); setTotalSeconds((v as number) * 60); } }}
                      min={15} max={50} step={5}
                      disabled={phase !== 'idle'}
                      marks={[{ value: 25, label: '25' }, { value: 50, label: '50' }]}
                      size="small"
                    />
                  </Box>
                  <Box>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="caption" sx={{ fontWeight: 600 }}>Pausa Curta</Typography>
                      <Typography variant="caption" sx={{ color: 'success.main', fontWeight: 700 }}>{shortBreakMin} min</Typography>
                    </Stack>
                    <Slider
                      value={shortBreakMin}
                      onChange={(_, v) => setShortBreakMin(v as number)}
                      min={3} max={10} step={1}
                      disabled={phase !== 'idle'}
                      marks={[{ value: 5, label: '5' }, { value: 10, label: '10' }]}
                      size="small"
                      sx={{ color: '#10b981' }}
                    />
                  </Box>
                  <Box>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="caption" sx={{ fontWeight: 600 }}>Pausa Longa</Typography>
                      <Typography variant="caption" sx={{ color: '#3b82f6', fontWeight: 700 }}>{longBreakMin} min</Typography>
                    </Stack>
                    <Slider
                      value={longBreakMin}
                      onChange={(_, v) => setLongBreakMin(v as number)}
                      min={10} max={30} step={5}
                      disabled={phase !== 'idle'}
                      marks={[{ value: 15, label: '15' }, { value: 30, label: '30' }]}
                      size="small"
                      sx={{ color: '#3b82f6' }}
                    />
                  </Box>
                  <Box>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="caption" sx={{ fontWeight: 600 }}>Ciclos até Pausa Longa</Typography>
                      <Typography variant="caption" sx={{ color: 'text.primary', fontWeight: 700 }}>{cyclesBeforeLong}</Typography>
                    </Stack>
                    <Slider
                      value={cyclesBeforeLong}
                      onChange={(_, v) => setCyclesBeforeLong(v as number)}
                      min={2} max={6} step={1}
                      disabled={phase !== 'idle'}
                      marks
                      size="small"
                    />
                  </Box>
                </Stack>
                <Paper variant="outlined" sx={{ p: 1.5, mt: 2, borderRadius: 2, bgcolor: alpha('#3b82f6', 0.04) }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', lineHeight: 1.5, display: 'block' }}>
                    <strong>Método Eslen Delanogare:</strong> Baseado em neurociência, alterna períodos de foco intenso com pausas para consolidação neural. O cérebro precisa de descanso para formar memórias de longo prazo.
                  </Typography>
                </Paper>
              </Paper>
            </Collapse>
          </CardContent>
        </Collapse>
      </Card>

      {/* Return Dialog — Brian Tracy Quote */}
      <Dialog
        open={showReturnDialog}
        onClose={() => setShowReturnDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            border: '1px solid',
            borderColor: alpha('#f97316', 0.2),
            bgcolor: 'background.paper',
            backgroundImage: 'none',
          },
        }}
      >
        <DialogContent sx={{ textAlign: 'center', pt: 5, pb: 2 }}>
          <WhatshotIcon sx={{ fontSize: 56, color: 'primary.main', mb: 2, filter: 'drop-shadow(0 0 16px rgba(249,115,22,0.3))' }} />
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 3 }}>
            Hora de Voltar, Fênix! 🔥
          </Typography>
          <Paper
            variant="outlined"
            sx={{
              p: 3, borderRadius: 3,
              borderLeft: '4px solid',
              borderLeftColor: 'primary.main',
              bgcolor: alpha('#f97316', 0.03),
              textAlign: 'left',
            }}
          >
            <Typography variant="body1" sx={{ fontStyle: 'italic', color: 'text.secondary', lineHeight: 1.7 }}>
              "{returnQuote}"
            </Typography>
            <Typography variant="overline" sx={{ color: 'primary.dark', fontSize: '0.6rem', mt: 1.5, display: 'block' }}>
              — Brian Tracy, Jornada Fênix
            </Typography>
          </Paper>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 3 }}>
            Seu cérebro está pronto para mais um ciclo de foco profundo.
            <br />Continue avançando em: <strong>{goalTitle}</strong>
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 4 }}>
          <Button
            variant="contained"
            size="large"
            startIcon={<WhatshotIcon />}
            onClick={() => {
              setShowReturnDialog(false);
              startStudy();
            }}
            sx={{ borderRadius: 8, px: 5, fontWeight: 700 }}
          >
            Continuar Jornada
          </Button>
          <Button
            variant="text"
            onClick={() => setShowReturnDialog(false)}
            sx={{ color: 'text.secondary' }}
          >
            Depois
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
