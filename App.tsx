
import React, { useState, useEffect } from 'react';
import { Goal, DailyTask } from './types';
import GoalWizard from './components/GoalWizard';
import GoalDashboard from './components/GoalDashboard';
import DailyTasks from './components/DailyTasks';
import {
  AppBar, Toolbar, Typography, Button, Container, Box, Card, CardContent,
  CardActionArea, Chip, LinearProgress, Stack, Fade, Grow, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BoltIcon from '@mui/icons-material/Bolt';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import StarIcon from '@mui/icons-material/Star';
import FavoriteIcon from '@mui/icons-material/Favorite';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import CancelIcon from '@mui/icons-material/Cancel';
import ReplayIcon from '@mui/icons-material/Replay';
import ShareIcon from '@mui/icons-material/Share';
import CheckIcon from '@mui/icons-material/Check';

const STORAGE_KEY = 'fenix_goals';
const STORAGE_KEY_DAILY = 'fenix_daily_tasks';
const STORAGE_KEY_SHARED = 'fenix_shared_goals';

function loadGoals(): Goal[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function loadDailyTasks(): DailyTask[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_DAILY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function loadSharedGoals(): Record<string, Goal> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SHARED);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function generateShareToken(): string {
  return Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10);
}

function getShareLink(token: string): string {
  const baseUrl = window.location.origin + window.location.pathname;
  return `${baseUrl}?share=${token}`;
}

export default function App() {
  const [goals, setGoals] = useState<Goal[]>(loadGoals);
  const [dailyTasks, setDailyTasks] = useState<DailyTask[]>(loadDailyTasks);
  const [sharedGoals, setSharedGoals] = useState<Record<string, Goal>>(loadSharedGoals);
  const [view, setView] = useState<'list' | 'create' | 'dashboard'>('list');
  const [activeGoalId, setActiveGoalId] = useState<string | null>(null);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareLink, setShareLink] = useState('');
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [goalToImport, setGoalToImport] = useState<Goal | null>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_DAILY, JSON.stringify(dailyTasks));
  }, [dailyTasks]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SHARED, JSON.stringify(sharedGoals));
  }, [sharedGoals]);

  // Check for share token in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shareToken = params.get('share');
    if (shareToken) {
      const shared = sharedGoals[shareToken];
      if (shared) {
        setGoalToImport(shared);
        setImportDialogOpen(true);
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, [sharedGoals]);

  // Auto-detect expired goals
  useEffect(() => {
    const checkExpired = () => {
      const now = new Date();
      setGoals(prev => prev.map(g => {
        if (g.status !== 'em_andamento') return g;
        const deadline = g.hora_limite
          ? new Date(`${g.data_limite}T${g.hora_limite}`)
          : new Date(g.data_limite);
        if (+deadline <= +now) {
          return { ...g, status: 'nao_concluido' as const };
        }
        return g;
      }));
    };
    checkExpired();
    const interval = setInterval(checkExpired, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleSaveGoal = (newGoal: Goal) => {
    setGoals((prev) => [...prev, newGoal]);
    setView('list');
  };

  const todayISO = () => new Date().toISOString().split('T')[0];

  const addDailyTask = (text: string, goalId?: string | null, date?: string) => {
    const dt: DailyTask = { id: crypto.randomUUID(), text: text.trim(), completed: false, date: date || todayISO(), goalId: goalId || null };
    setDailyTasks(prev => [dt, ...prev]);
  };

  const toggleDailyTask = (id: string) => {
    setDailyTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed, completedAt: !t.completed ? Date.now() : undefined } : t));
  };

  const deleteDailyTask = (id: string) => {
    setDailyTasks(prev => prev.filter(t => t.id !== id));
  };

  const assignTaskToGoal = (id: string, goalId?: string | null) => {
    setDailyTasks(prev => prev.map(t => t.id === id ? { ...t, goalId: goalId || null } : t));
  };

  const handleUpdateGoal = (updatedGoal: Goal) => {
    setGoals((prev) => prev.map((g) => (g.id === updatedGoal.id ? updatedGoal : g)));
  };

  const handleViewGoal = (id: string) => {
    setActiveGoalId(id);
    setView('dashboard');
  };

  const handleShareGoal = (goalId: string) => {
    const goal = goals.find(g => g.id === goalId);
    if (goal) {
      const token = generateShareToken();
      const goalWithToken = { ...goal, shareToken: token, sharedAt: Date.now() };
      setSharedGoals(prev => ({ ...prev, [token]: goalWithToken }));
      setShareLink(getShareLink(token));
      setShareDialogOpen(true);
    }
  };

  const handleImportGoal = () => {
    if (goalToImport) {
      const newGoal = {
        ...goalToImport,
        id: crypto.randomUUID(),
        createdAt: Date.now(),
        plano_acao: goalToImport.plano_acao.map(t => ({ ...t, completed: false, completedAt: undefined })),
        status: 'em_andamento' as const,
        completedAt: undefined,
        isShared: true,
        sharedBy: goalToImport.titulo,
      };
      setGoals(prev => [...prev, newGoal]);
      setImportDialogOpen(false);
      setGoalToImport(null);
      setView('list');
    }
  };

  const activeGoal = goals.find((g) => g.id === activeGoalId);
  const activeGoals = goals.filter(g => g.status === 'em_andamento');
  const completedGoals = goals.filter(g => g.status === 'concluido');
  const failedGoals = goals.filter(g => g.status === 'nao_concluido');

  return (
    <Box sx={{ minHeight: '100vh' }}>
      {/* App Bar */}
      <AppBar position="sticky" elevation={0}>
        <Toolbar sx={{ maxWidth: 1152, width: '100%', mx: 'auto', px: { xs: 2, md: 3 }, height: 72 }}>
          <Box
            sx={{ display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer', flexGrow: 1 }}
            onClick={() => setView('list')}
          >
            <Box sx={{ position: 'relative', display: 'flex' }}>
              <WhatshotIcon sx={{ fontSize: 32, color: 'primary.main', filter: 'drop-shadow(0 0 8px rgba(249,115,22,0.4))' }} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.1, color: 'white' }}>
                Fênix Goals
              </Typography>
              <Typography variant="overline" sx={{ fontSize: '0.6rem', color: 'primary.light', display: 'flex', alignItems: 'center', gap: 0.5, lineHeight: 1.4 }}>
                <BoltIcon sx={{ fontSize: 12 }} /> Potencial Infinito
              </Typography>
            </Box>
          </Box>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setView('create')}
            sx={{ borderRadius: 8, px: 3, fontWeight: 700, fontSize: '0.8rem' }}
          >
            Novo Objetivo
          </Button>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        {view === 'list' && (
          <Fade in timeout={600}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {/* Hero */}
              <Box sx={{ maxWidth: 720 }}>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                  <FavoriteIcon sx={{ color: 'primary.main', fontSize: 22 }} />
                  <Typography variant="overline" sx={{ color: 'primary.light', fontSize: '0.7rem' }}>
                    Bem-vindo de volta
                  </Typography>
                </Stack>
                <Typography variant="h2" sx={{ fontSize: { xs: '2.5rem', md: '3.8rem' }, fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 0.95, mb: 3 }}>
                  Desperte o seu{' '}
                  <Box component="span" sx={{ background: 'linear-gradient(135deg, #fb923c, #f97316)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontStyle: 'italic' }}>
                    potencial agora
                  </Box>
                  .
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary', fontSize: '1.1rem', maxWidth: 600, lineHeight: 1.7, fontWeight: 300 }}>
                  Transforme desejos em realidade com clareza absoluta. Sua jornada para alta performance começa aqui.
                </Typography>
                <Card sx={{ mt: 4, borderLeft: '4px solid', borderColor: 'primary.dark', bgcolor: alpha('#f97316', 0.04) }}>
                  <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
                    <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary', lineHeight: 1.6 }}>
                      "Você se torna aquilo em que pensa a maior parte do tempo."
                    </Typography>
                    <Typography variant="overline" sx={{ color: 'primary.dark', fontSize: '0.6rem', mt: 1, display: 'block' }}>
                      — Brian Tracy
                    </Typography>
                  </CardContent>
                </Card>
              </Box>

              {/* Daily Tasks */}
              <DailyTasks
                dailyTasks={dailyTasks}
                goals={goals}
                onAdd={addDailyTask}
                onToggle={toggleDailyTask}
                onDelete={deleteDailyTask}
                onAssign={assignTaskToGoal}
              />

              {/* Empty State */}
              {goals.length === 0 ? (
                <Grow in timeout={800}>
                  <Card
                    sx={{
                      textAlign: 'center',
                      py: 10,
                      px: 4,
                      border: '2px dashed',
                      borderColor: 'divider',
                      bgcolor: 'transparent',
                      '&:hover': { borderColor: alpha('#f97316', 0.3) },
                    }}
                  >
                    <CardContent>
                      <Box sx={{ position: 'relative', mb: 3, display: 'inline-flex' }}>
                        <AutoStoriesIcon sx={{ fontSize: 56, color: 'text.secondary', opacity: 0.4 }} />
                        <StarIcon sx={{ fontSize: 28, color: 'primary.light', position: 'absolute', top: -4, right: -12, animation: 'pulse 2s infinite' }} />
                      </Box>
                      <Typography variant="h5" sx={{ mb: 1, fontWeight: 700 }}>Inicie sua primeira jornada</Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 4 }}>
                        Crie um objetivo e comece sua transformação pessoal agora
                      </Typography>
                      <Button variant="contained" size="large" onClick={() => setView('create')} startIcon={<RocketLaunchIcon />} sx={{ borderRadius: 8, px: 4 }}>
                        Definir Objetivo Primário
                      </Button>
                    </CardContent>
                  </Card>
                </Grow>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {/* Active Goals */}
                  {activeGoals.length > 0 && (
                    <Box>
                      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 4 }}>
                        <WhatshotIcon sx={{ fontSize: 18, color: 'primary.main' }} />
                        <Typography variant="overline" sx={{ color: 'primary.main', fontSize: '0.7rem' }}>
                          Jornadas Ativas
                        </Typography>
                      </Stack>
                      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, gap: 3 }}>
                        {activeGoals.map((goal) => {
                          const progress = (goal.plano_acao.filter(t => t.completed).length / Math.max(goal.plano_acao.length, 1)) * 100;
                          return (
                            <Card key={goal.id} sx={{ cursor: 'pointer', '&:hover': { transform: 'translateY(-4px)' } }}>
                              <CardActionArea onClick={() => handleViewGoal(goal.id)} sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
                                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
                                  <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2, flex: 1, pr: 1 }}>
                                    {goal.titulo}
                                  </Typography>
                                  <BoltIcon sx={{ fontSize: 20, color: alpha('#f97316', 0.5) }} />
                                </Stack>
                                <Box sx={{ mt: 'auto', pt: 2 }}>
                                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                                    <Typography variant="overline" sx={{ fontSize: '0.6rem', color: 'text.secondary' }}>Progresso</Typography>
                                    <Chip label={`${Math.round(progress)}%`} size="small" color="primary" variant="outlined" sx={{ height: 22, fontSize: '0.65rem' }} />
                                  </Stack>
                                  <LinearProgress variant="determinate" value={progress} sx={{ borderRadius: 1 }} />
                                </Box>
                              </CardActionArea>
                            </Card>
                          );
                        })}
                      </Box>
                    </Box>
                  )}

                  {/* Failed Goals */}
                  {failedGoals.length > 0 && (
                    <Box>
                      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 4 }}>
                        <CancelIcon sx={{ fontSize: 18, color: 'error.main' }} />
                        <Typography variant="overline" sx={{ color: 'error.main', fontSize: '0.7rem' }}>
                          Não Concluídos
                        </Typography>
                      </Stack>
                      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, gap: 3 }}>
                        {failedGoals.map((goal) => (
                          <Card
                            key={goal.id}
                            sx={{
                              cursor: 'pointer',
                              borderColor: alpha('#ef4444', 0.2),
                              opacity: 0.85,
                              '&:hover': { borderColor: alpha('#ef4444', 0.5), transform: 'translateY(-4px)', opacity: 1 },
                            }}
                          >
                            <CardActionArea onClick={() => handleViewGoal(goal.id)} sx={{ p: 3 }}>
                              <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1.5 }}>
                                <Typography variant="h6" sx={{ fontWeight: 700, color: alpha('#ef4444', 0.8) }}>{goal.titulo}</Typography>
                                <CancelIcon sx={{ fontSize: 24, color: 'error.main' }} />
                              </Stack>
                              <Typography variant="overline" sx={{ color: 'error.dark', fontSize: '0.6rem' }}>
                                ✗ Prazo Expirado
                              </Typography>
                            </CardActionArea>
                          </Card>
                        ))}
                      </Box>
                    </Box>
                  )}

                  {/* Completed Goals */}
                  {completedGoals.length > 0 && (
                    <Box>
                      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 4 }}>
                        <EmojiEventsIcon sx={{ fontSize: 18, color: 'secondary.main' }} />
                        <Typography variant="overline" sx={{ color: 'secondary.main', fontSize: '0.7rem' }}>
                          Salão de Conquistas
                        </Typography>
                      </Stack>
                      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, gap: 3 }}>
                        {completedGoals.map((goal) => (
                          <Card
                            key={goal.id}
                            sx={{
                              cursor: 'pointer',
                              borderColor: alpha('#10b981', 0.2),
                              '&:hover': { borderColor: alpha('#10b981', 0.5), transform: 'translateY(-4px)', boxShadow: `0 8px 32px ${alpha('#10b981', 0.1)}` },
                            }}
                          >
                            <CardActionArea onClick={() => handleViewGoal(goal.id)} sx={{ p: 3 }}>
                              <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1.5 }}>
                                <Typography variant="h6" sx={{ fontWeight: 700, color: '#6ee7b7' }}>{goal.titulo}</Typography>
                                <CheckCircleIcon sx={{ fontSize: 24, color: 'secondary.main' }} />
                              </Stack>
                              <Typography variant="overline" sx={{ color: 'secondary.dark', fontSize: '0.6rem' }}>
                                ✓ Jornada Completada
                              </Typography>
                            </CardActionArea>
                          </Card>
                        ))}
                      </Box>
                    </Box>
                  )}
                </Box>
              )}
            </Box>
          </Fade>
        )}

        {view === 'create' && <GoalWizard onSave={handleSaveGoal} onCancel={() => setView('list')} />}
        {view === 'dashboard' && activeGoal && (
          <GoalDashboard
            goal={activeGoal}
            onBack={() => setView('list')}
            onUpdate={handleUpdateGoal}
            onShare={handleShareGoal}
            dailyTasks={dailyTasks}
            onToggleDailyTask={toggleDailyTask}
            onDeleteDailyTask={deleteDailyTask}
          />
        )}

      </Container>

      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onClose={() => setShareDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, fontSize: '1.2rem' }}>Compartilhar Objetivo</DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Stack spacing={3}>
            <Box>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                Link de Compartilhamento:
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, p: 1.5, bgcolor: alpha('#f97316', 0.05), borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="body2" sx={{ flex: 1, wordBreak: 'break-all', fontFamily: 'monospace', fontSize: '0.85rem' }}>
                  {shareLink}
                </Typography>
                <Button
                  size="small"
                  onClick={() => {
                    navigator.clipboard.writeText(shareLink);
                  }}
                  sx={{ flexShrink: 0 }}
                >
                  Copiar
                </Button>
              </Box>
            </Box>
            <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.9rem' }}>
              Compartilhe este link para que outras pessoas possam importar e continuar este objetivo em suas próprias contas.
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setShareDialogOpen(false)}>Fechar</Button>
        </DialogActions>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={importDialogOpen} onClose={() => setImportDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, fontSize: '1.2rem' }}>Importar Objetivo Compartilhado</DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {goalToImport && (
            <Stack spacing={2}>
              <Box sx={{ p: 2, bgcolor: alpha('#f97316', 0.05), borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
                  Objetivo:
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {goalToImport.titulo}
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Este objetivo será importado com todas as suas informações e você poderá começar a trabalhar nele do zero.
              </Typography>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setImportDialogOpen(false)}>Cancelar</Button>
          <Button variant="contained" startIcon={<CheckIcon />} onClick={handleImportGoal}>
            Importar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Footer */}
      <Box sx={{ maxWidth: 1152, mx: 'auto', px: 3, py: 6, borderTop: '1px solid', borderColor: 'divider', textAlign: 'center' }}>
        <Typography variant="overline" sx={{ color: 'text.secondary', fontSize: '0.6rem', opacity: 0.6 }}>
          Baseado no Seminário Fênix de Brian Tracy • Transformando Sonhos em Realidade
        </Typography>
      </Box>
    </Box>
  );
}
