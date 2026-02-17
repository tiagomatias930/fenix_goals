import React, { useState, useEffect, useMemo } from 'react';
import { Goal, ActionItem } from '../types';
import StudyTimer from './StudyTimer';
import {
  Box, Typography, Button, Card, CardContent, Stack, Chip, IconButton,
  Paper, LinearProgress, List, ListItem, ListItemButton, ListItemIcon,
  ListItemText, Divider, Fade
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CircularProgress from '@mui/material/CircularProgress';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import CheckIcon from '@mui/icons-material/Check';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import FavoriteIcon from '@mui/icons-material/Favorite';
import BoltIcon from '@mui/icons-material/Bolt';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PrintIcon from '@mui/icons-material/Print';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';

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
      const deadline = goal.hora_limite
        ? new Date(`${goal.data_limite}T${goal.hora_limite}`)
        : new Date(goal.data_limite);
      const diff = +deadline - +new Date();
      if (diff <= 0) { setTimeLeft("Expirado"); return; }
      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const m = Math.floor((diff / (1000 * 60)) % 60);
      setTimeLeft(`${d}d ${h}h ${m}m`);
    }, 1000);
    return () => clearInterval(timer);
  }, [goal.data_limite, goal.hora_limite, goal.status]);

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

  const completedCount = goal.plano_acao.filter(t => t.completed).length;
  const totalCount = goal.plano_acao.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

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
      const prog = ((index + 1) / totalTasks) * 100;
      const xPercent = ((task.completedAt! - startTime) / timeRange) * 100;
      points.push({ x: xPercent, y: 100 - prog });
    });
    if (points[points.length - 1].x < 100) {
      points.push({ ...points[points.length - 1], x: 100 });
    }
    return points;
  }, [goal]);

  const pathData = dataPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  return (
    <Fade in timeout={500}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4, pb: 8 }}>
        {/* Top Bar */}
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={onBack}
            sx={{ color: 'text.secondary', fontWeight: 700, fontSize: '0.8rem' }}
          >
            Voltar
          </Button>
          <Chip
            label={goal.status === 'concluido' ? '✓ Concluído' : 'Em Andamento'}
            color={goal.status === 'concluido' ? 'success' : 'primary'}
            variant="outlined"
            sx={{ fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', fontSize: '0.65rem' }}
          />
        </Stack>

        {/* Hero Card */}
        <Card sx={{ position: 'relative', overflow: 'hidden' }}>
          {/* Background Image Overlay */}
          {goal.imagem_visualizacao && (
            <Box sx={{
              position: 'absolute', inset: 0,
              backgroundImage: `url(${goal.imagem_visualizacao})`,
              backgroundSize: 'cover', backgroundPosition: 'center',
              opacity: 0.03,
            }} />
          )}
          <Box sx={{ position: 'absolute', inset: 0, background: `linear-gradient(135deg, ${alpha('#f97316', 0.04)}, transparent)`, pointerEvents: 'none' }} />
          <CardContent sx={{ p: { xs: 4, md: 6 }, position: 'relative' }}>
            <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ md: 'flex-end' }} spacing={4}>
              <Box sx={{ flex: 1 }}>
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
                  <WhatshotIcon sx={{ color: 'primary.main', fontSize: 28 }} />
                  <Typography variant="h3" sx={{ fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1 }}>
                    {goal.titulo}
                  </Typography>
                </Stack>
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, borderLeft: '4px solid', borderLeftColor: 'primary.main', bgcolor: alpha('#f97316', 0.03), mt: 2 }}>
                  <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary', lineHeight: 1.6 }}>
                    {goal.ponto_partida}
                  </Typography>
                </Paper>
              </Box>

              <Stack spacing={2} alignItems={{ xs: 'stretch', md: 'flex-end' }} sx={{ flexShrink: 0 }}>
                {goal.status !== 'concluido' && (
                  <Card sx={{ bgcolor: alpha('#f97316', 0.06), border: '1px solid', borderColor: alpha('#f97316', 0.2), textAlign: 'center', px: 3, py: 2 }}>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: 'primary.light' }}>{timeLeft}</Typography>
                    <Stack direction="row" spacing={0.5} alignItems="center" justifyContent="center" sx={{ mt: 0.5 }}>
                      <AccessTimeIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                      <Typography variant="overline" sx={{ fontSize: '0.6rem', color: 'text.secondary' }}>Tempo Restante</Typography>
                    </Stack>
                  </Card>
                )}
                <Stack direction="row" spacing={1} justifyContent="flex-end">
                  <IconButton
                    onClick={handleGenerateImage}
                    disabled={isGenerating}
                    sx={{ border: '1px solid', borderColor: 'divider', '&:hover': { borderColor: 'primary.main', color: 'primary.main' } }}
                  >
                    {isGenerating ? <CircularProgress size={20} /> : <AutoAwesomeIcon />}
                  </IconButton>
                  {goal.status === 'concluido' ? (
                    <Button
                      variant="outlined"
                      startIcon={<PrintIcon />}
                      onClick={() => window.print()}
                      sx={{ borderRadius: 8, fontWeight: 700, fontSize: '0.8rem' }}
                    >
                      Certificado
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      startIcon={<WhatshotIcon />}
                      onClick={completeGoal}
                      sx={{ borderRadius: 8, fontWeight: 700, fontSize: '0.8rem' }}
                    >
                      Finalizar Meta
                    </Button>
                  )}
                </Stack>
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        {/* Progress Chart */}
        <Card>
          <CardContent sx={{ p: 3 }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 3 }}>
              <TrendingUpIcon sx={{ fontSize: 18, color: 'primary.main' }} />
              <Typography variant="overline" sx={{ color: 'primary.light', fontSize: '0.65rem' }}>
                Linha do Tempo de Evolução
              </Typography>
            </Stack>
            <Box sx={{ position: 'relative', height: 160, width: '100%' }}>
              <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
                <path d={`${pathData} L 100 100 L 0 100 Z`} fill="rgba(249, 115, 22, 0.08)" />
                <path d={pathData} fill="none" stroke="#f97316" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Box>
          </CardContent>
        </Card>

        {/* Study Timer — Método Delanogare */}
        {goal.status !== 'concluido' && (
          <StudyTimer goalTitle={goal.titulo} />
        )}

        {/* Main Content Grid */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '4fr 8fr' }, gap: 3 }}>
          {/* Left Column */}
          <Stack spacing={3}>
            {/* Motivation */}
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 3 }}>
                  <FavoriteIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                  <Typography variant="overline" sx={{ color: 'primary.light', fontSize: '0.65rem' }}>
                    Motivação
                  </Typography>
                </Stack>
                <Stack spacing={2}>
                  {goal.lista_porques.map((why, i) => (
                    <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                      <Chip label={`#${i + 1}`} size="small" color="primary" sx={{ fontSize: '0.6rem', fontWeight: 700, minWidth: 32, height: 22 }} />
                      <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.5 }}>{why}</Typography>
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>

            {/* Obstacle */}
            <Card sx={{ borderColor: alpha('#ef4444', 0.2), '&:hover': { borderColor: alpha('#ef4444', 0.4) } }}>
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                  <WarningAmberIcon sx={{ fontSize: 16, color: 'error.main' }} />
                  <Typography variant="overline" sx={{ color: 'error.main', fontSize: '0.65rem' }}>
                    Obstáculo
                  </Typography>
                </Stack>
                <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary', lineHeight: 1.6 }}>
                  {goal.obstaculo_principal}
                </Typography>
              </CardContent>
            </Card>
          </Stack>

          {/* Right Column: Action Plan */}
          <Card sx={{ overflow: 'hidden' }}>
            <Box sx={{ px: 3, py: 2.5, borderBottom: '1px solid', borderColor: 'divider', bgcolor: alpha('#000', 0.2), display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <CheckBoxIcon sx={{ fontSize: 18, color: 'primary.main' }} />
                <Typography variant="overline" sx={{ fontSize: '0.7rem', fontWeight: 700 }}>
                  Plano de Ação
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Chip
                  icon={<CheckCircleIcon sx={{ fontSize: '14px !important' }} />}
                  label={`${completedCount}/${totalCount}`}
                  size="small"
                  variant="outlined"
                  sx={{ height: 26, fontSize: '0.7rem', fontWeight: 700 }}
                />
              </Stack>
            </Box>
            <Box sx={{ px: 1 }}>
              <LinearProgress variant="determinate" value={progress} sx={{ mx: 2, mt: 2, mb: 0.5, borderRadius: 1 }} />
            </Box>
            <List disablePadding>
              {goal.plano_acao.map((task, idx) => (
                <React.Fragment key={task.id}>
                  <ListItem disablePadding>
                    <ListItemButton
                      onClick={() => toggleTask(task.id)}
                      sx={{
                        py: 2, px: 3,
                        borderLeft: '3px solid',
                        borderLeftColor: task.completed ? 'success.main' : 'transparent',
                        '&:hover': { borderLeftColor: task.completed ? 'success.main' : 'primary.main' },
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        {task.completed ? (
                          <CheckCircleIcon sx={{ color: 'primary.main', fontSize: 24, filter: `drop-shadow(0 0 6px ${alpha('#f97316', 0.4)})` }} />
                        ) : (
                          <RadioButtonUncheckedIcon sx={{ color: 'text.secondary', fontSize: 24 }} />
                        )}
                      </ListItemIcon>
                      <ListItemText
                        primary={task.text}
                        primaryTypographyProps={{
                          variant: 'body2',
                          sx: {
                            textDecoration: task.completed ? 'line-through' : 'none',
                            color: task.completed ? 'text.secondary' : 'text.primary',
                          },
                        }}
                      />
                      {task.completed && (
                        <Chip label="✓" size="small" color="success" variant="outlined" sx={{ ml: 1, height: 22, fontSize: '0.65rem', fontWeight: 700 }} />
                      )}
                    </ListItemButton>
                  </ListItem>
                  {idx < goal.plano_acao.length - 1 && <Divider variant="inset" component="li" />}
                </React.Fragment>
              ))}
            </List>
          </Card>
        </Box>
      </Box>
    </Fade>
  );
}
