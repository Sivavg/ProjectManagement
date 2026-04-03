import { useMemo, useState } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box, Typography, Button, Paper, Avatar, AvatarGroup, Chip, Divider,
  Stack, Grid, LinearProgress, Tooltip, IconButton, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Card, CardContent,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CalendarToday as CalIcon,
  People as PeopleIcon,
  Assignment as TaskIcon,
  CheckCircle as DoneIcon,
  RadioButtonUnchecked as TodoIcon,
  Autorenew as InProgressIcon,
  BugReport as TestIcon,
  Refresh as ReopenIcon,
  AccessTime as EtaIcon,
} from '@mui/icons-material';
import { format, isPast } from 'date-fns';
import { deleteProject } from './projectsSlice';

const STATUS_COLORS = {
  'Completed':     'success',
  'In Progress':   'primary',
  'Need for Test': 'warning',
  'Re-open':       'error',
  'Need to Do':    'default',
};

const STATUS_ICONS = {
  'Need to Do':    <TodoIcon sx={{ fontSize: 14 }} />,
  'In Progress':   <InProgressIcon sx={{ fontSize: 14 }} />,
  'Need for Test': <TestIcon sx={{ fontSize: 14 }} />,
  'Completed':     <DoneIcon sx={{ fontSize: 14 }} />,
  'Re-open':       <ReopenIcon sx={{ fontSize: 14 }} />,
};

const STATUSES = ['Need to Do', 'In Progress', 'Need for Test', 'Completed', 'Re-open'];

const ACCENT = {
  'Need to Do':    '#64748b',
  'In Progress':   '#2563eb',
  'Need for Test': '#d97706',
  'Completed':     '#16a34a',
  'Re-open':       '#dc2626',
};

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate  = useNavigate();
  const dispatch  = useDispatch();

  const project   = useSelector((s) => s.projects.list.find((p) => p.id === id));
  const employees = useSelector((s) => s.employees.list);
  const allTasks  = useSelector((s) => s.tasks.list);

  const projectTasks = useMemo(
    () => allTasks.filter((t) => t.projectId === id),
    [allTasks, id],
  );

  const teamMembers = useMemo(
    () => (project?.assignedEmployeeIds || [])
      .map((eid) => employees.find((e) => e.id === eid))
      .filter(Boolean),
    [project, employees],
  );

  const statusCounts = useMemo(() => {
    const counts = {};
    STATUSES.forEach((s) => { counts[s] = 0; });
    projectTasks.forEach((t) => { if (counts[t.status] !== undefined) counts[t.status]++; });
    return counts;
  }, [projectTasks]);

  const completionPct = projectTasks.length
    ? Math.round((statusCounts['Completed'] / projectTasks.length) * 100)
    : 0;

  const resolveEmployee = (task) =>
    task.assignedEmployeeId
      ? employees.find((e) => e.id === task.assignedEmployeeId) || null
      : null;

  const handleDelete = () => {
    if (window.confirm('Delete this project? All its tasks will remain but become unlinked.')) {
      dispatch(deleteProject(id));
      navigate('/projects');
    }
  };

  if (!project) {
    return (
      <Box sx={{ textAlign: 'center', py: 10 }}>
        <Typography variant="h5" color="text.secondary" gutterBottom>
          Project not found
        </Typography>
        <Button startIcon={<BackIcon />} onClick={() => navigate('/projects')}>
          Back to Projects
        </Button>
      </Box>
    );
  }

  const isOverdue = isPast(new Date(project.endDate)) && statusCounts['Completed'] < projectTasks.length;

  return (
    <Box>
      {/* ── Back + Actions ── */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Button
          startIcon={<BackIcon />}
          onClick={() => navigate('/projects')}
          sx={{ color: 'text.secondary' }}
        >
          Back to Projects
        </Button>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Delete Project">
            <IconButton color="error" size="small" onClick={handleDelete}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* ── Project Hero ── */}
      <Paper
        sx={{
          p: 3, mb: 3, borderRadius: 2,
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          color: '#fff',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative circle */}
        <Box sx={{
          position: 'absolute', right: -40, top: -40,
          width: 200, height: 200, borderRadius: '50%',
          background: 'rgba(255,255,255,0.04)',
        }} />

        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2.5, position: 'relative' }}>
          <Avatar
            src={project.logo}
            variant="rounded"
            sx={{ width: 64, height: 64, borderRadius: 2, fontSize: 28, bgcolor: '#334155' }}
          >
            {project.title[0]}
          </Avatar>

          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
              <Typography variant="h5" fontWeight={700}>
                {project.title}
              </Typography>
              {isOverdue && (
                <Chip label="Overdue" size="small" color="error" sx={{ fontWeight: 600 }} />
              )}
              {statusCounts['Completed'] === projectTasks.length && projectTasks.length > 0 && (
                <Chip label="Completed" size="small" color="success" sx={{ fontWeight: 600 }} />
              )}
            </Box>

            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.65)', mt: 0.5, mb: 2 }}>
              {project.description}
            </Typography>

            <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, color: 'rgba(255,255,255,0.6)' }}>
                <CalIcon sx={{ fontSize: 15 }} />
                <Typography variant="caption">
                  {format(new Date(project.startDate), 'MMM dd, yyyy')} — {format(new Date(project.endDate), 'MMM dd, yyyy')}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, color: 'rgba(255,255,255,0.6)' }}>
                <PeopleIcon sx={{ fontSize: 15 }} />
                <Typography variant="caption">{teamMembers.length} team member{teamMembers.length !== 1 ? 's' : ''}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, color: 'rgba(255,255,255,0.6)' }}>
                <TaskIcon sx={{ fontSize: 15 }} />
                <Typography variant="caption">{projectTasks.length} task{projectTasks.length !== 1 ? 's' : ''}</Typography>
              </Box>
            </Box>
          </Box>

          {/* Completion Ring */}
          <Box sx={{ textAlign: 'center', minWidth: 72 }}>
            <Typography variant="h4" fontWeight={800} color={completionPct === 100 ? '#4ade80' : '#fff'}>
              {completionPct}%
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>done</Typography>
          </Box>
        </Box>

        {/* Progress bar */}
        <Box sx={{ mt: 3 }}>
          <LinearProgress
            variant="determinate"
            value={completionPct}
            sx={{
              height: 6, borderRadius: 3,
              bgcolor: 'rgba(255,255,255,0.12)',
              '& .MuiLinearProgress-bar': {
                bgcolor: completionPct === 100 ? '#4ade80' : '#60a5fa',
                borderRadius: 3,
              },
            }}
          />
        </Box>
      </Paper>

      {/* ── Stats Row ── */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {STATUSES.map((s) => (
          <Grid item xs={6} sm={4} md={2.4} key={s}>
            <Card variant="outlined" sx={{ borderRadius: 2, borderColor: `${ACCENT[s]}30` }}>
              <CardContent sx={{ p: '12px 16px !important' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.5 }}>
                  <Box sx={{ color: ACCENT[s] }}>{STATUS_ICONS[s]}</Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}
                    sx={{ textTransform: 'uppercase', letterSpacing: '0.04em', fontSize: '0.65rem' }}>
                    {s}
                  </Typography>
                </Box>
                <Typography variant="h5" fontWeight={700} sx={{ color: ACCENT[s] }}>
                  {statusCounts[s]}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* ── Two-column layout ── */}
      <Grid container spacing={2.5}>

        {/* Team Members */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2.5, borderRadius: 2, height: '100%' }}>
            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
              Team ({teamMembers.length})
            </Typography>
            {teamMembers.length === 0 ? (
              <Typography variant="body2" color="text.secondary">No team members assigned.</Typography>
            ) : (
              <Stack spacing={1.5}>
                {teamMembers.map((emp) => (
                  <Box key={emp.id} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar src={emp.profileImage} sx={{ width: 36, height: 36 }}>
                      {emp.name[0]}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight={600}>{emp.name}</Typography>
                      <Typography variant="caption" color="text.secondary">{emp.position}</Typography>
                    </Box>
                    <Box sx={{ ml: 'auto' }}>
                      <Chip
                        label={projectTasks.filter((t) => t.assignedEmployeeId === emp.id).length + ' tasks'}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: '0.65rem', height: 20 }}
                      />
                    </Box>
                  </Box>
                ))}
              </Stack>
            )}
          </Paper>
        </Grid>

        {/* Tasks Table */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
            <Box sx={{ px: 2.5, py: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="subtitle1" fontWeight={700}>
                Tasks ({projectTasks.length})
              </Typography>
              <Button
                size="small"
                variant="outlined"
                component={RouterLink}
                to="/tasks"
                sx={{ fontSize: '0.75rem' }}
              >
                Manage Tasks
              </Button>
            </Box>
            <Divider />
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Title</TableCell>
                    <TableCell>Assigned To</TableCell>
                    <TableCell>ETA</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {projectTasks.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 5, color: 'text.secondary' }}>
                        <TaskIcon sx={{ fontSize: 36, opacity: 0.2, display: 'block', mx: 'auto', mb: 1 }} />
                        No tasks linked to this project yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    projectTasks.map((task) => {
                      const emp = resolveEmployee(task);
                      const etaDate = new Date(task.eta);
                      const etaOverdue = isPast(etaDate) && task.status !== 'Completed';
                      return (
                        <TableRow key={task.id} hover>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              {task.referenceImage && (
                                <Box
                                  component="img"
                                  src={task.referenceImage}
                                  sx={{ width: 32, height: 32, borderRadius: 1, objectFit: 'cover', border: '1px solid #e2e8f0', flexShrink: 0 }}
                                />
                              )}
                              <Typography variant="body2" fontWeight={500}>{task.title}</Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            {emp ? (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Avatar src={emp.profileImage} sx={{ width: 22, height: 22, fontSize: '0.6rem' }}>
                                  {emp.name[0]}
                                </Avatar>
                                <Typography variant="caption">{emp.name}</Typography>
                              </Box>
                            ) : (
                              <Typography variant="caption" color="text.secondary">—</Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4, color: etaOverdue ? 'error.main' : 'text.secondary' }}>
                              <EtaIcon sx={{ fontSize: 12 }} />
                              <Typography variant="caption" fontWeight={etaOverdue ? 600 : 400}>
                                {format(etaDate, 'MMM dd, yyyy')}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={task.status}
                              size="small"
                              color={STATUS_COLORS[task.status] || 'default'}
                              sx={{ fontSize: '0.65rem', height: 20 }}
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
