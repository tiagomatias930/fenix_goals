import React, { useState } from 'react';
import { DailyTask, Goal } from '../types';
import { Box, Card, CardContent, TextField, Button, List, ListItem, ListItemText, IconButton, Chip, Stack, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';

interface Props {
  dailyTasks: DailyTask[];
  goals: Goal[];
  onAdd: (text: string, goalId?: string | null, date?: string) => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onAssign: (id: string, goalId?: string | null) => void;
}

export default function DailyTasks({ dailyTasks, goals, onAdd, onToggle, onDelete, onAssign }: Props) {
  const [text, setText] = useState('');
  const [selectedGoal, setSelectedGoal] = useState<string | ''>('');

  const today = new Date().toISOString().split('T')[0];

  const todayTasks = dailyTasks.filter(t => t.date === today);

  const handleAdd = () => {
    if (!text.trim()) return;
    onAdd(text.trim(), selectedGoal || null, today);
    setText('');
    setSelectedGoal('');
  };

  return (
    <Card>
      <CardContent>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <TextField
            placeholder="Adicionar tarefa diária..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            fullWidth
            size="small"
          />
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Vincular a</InputLabel>
            <Select
              label="Vincular a"
              value={selectedGoal}
              onChange={(e) => setSelectedGoal(e.target.value as string)}
            >
              <MenuItem value="">Nenhum</MenuItem>
              {goals.map(g => (
                <MenuItem key={g.id} value={g.id}>{g.titulo}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleAdd} sx={{ whiteSpace: 'nowrap' }}>Adicionar</Button>
        </Stack>

        <List disablePadding>
          {todayTasks.length === 0 && (
            <ListItem>
              <ListItemText primary="Nenhuma tarefa para hoje" secondary="Adicione uma tarefa rápida acima." />
            </ListItem>
          )}
          {todayTasks.map(task => (
            <ListItem key={task.id} secondaryAction={
              <Stack direction="row" spacing={1} alignItems="center">
                <Chip label={task.goalId ? (goals.find(g => g.id === task.goalId)?.titulo ?? 'Objetivo') : 'Sem objetivo'} size="small" />
                <IconButton edge="end" onClick={() => onDelete(task.id)}><DeleteIcon /></IconButton>
              </Stack>
            }>
              <IconButton onClick={() => onToggle(task.id)} sx={{ mr: 1 }}>
                {task.completed ? <CheckCircleIcon color="success" /> : <RadioButtonUncheckedIcon />}
              </IconButton>
              <ListItemText primary={task.text} secondary={task.completed ? `Concluída em ${task.completedAt ? new Date(task.completedAt).toLocaleTimeString() : ''}` : ''} />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
}
