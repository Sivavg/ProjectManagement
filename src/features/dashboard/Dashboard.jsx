import { useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box, Typography, FormControl, InputLabel, Select, MenuItem,
  Paper, Avatar, Chip, Tooltip,
} from '@mui/material';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { updateTaskStatus } from '../tasks/tasksSlice';
import { format } from 'date-fns';
import { AccessTime as TimeIcon } from '@mui/icons-material';

const COLUMNS = ['Need to Do', 'In Progress', 'Need for Test', 'Completed', 'Re-open'];

const COLUMN_COLORS = {
  'Need to Do':    '#64748b',
  'In Progress':   '#2563eb',
  'Need for Test': '#d97706',
  'Completed':     '#16a34a',
  'Re-open':       '#dc2626',
};

export default function Dashboard() {
  const tasks     = useSelector((state) => state.tasks.list);
  const projects  = useSelector((state) => state.projects.list);
  const employees = useSelector((state) => state.employees.list);
  const dispatch  = useDispatch();

  const resolveEmployee = (task) =>
    task.assignedEmployeeId
      ? employees.find(e => e.id === task.assignedEmployeeId) || null
      : task.assignedEmployee || null; // backward compat

  const [selectedProjectId, setSelectedProjectId] = useState('all');

  const filteredTasks = useMemo(() => {
    if (selectedProjectId === 'all') return tasks;
    return tasks.filter(t => t.projectId === selectedProjectId);
  }, [tasks, selectedProjectId]);

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const { source, destination, draggableId } = result;
    if (source.droppableId !== destination.droppableId) {
      dispatch(updateTaskStatus({ id: draggableId, status: destination.droppableId }));
    }
  };

  return (
    <Box sx={{ height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4">Task Board</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''}
            {selectedProjectId !== 'all' ? ' in this project' : ''}
          </Typography>
        </Box>
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel>Filter by Project</InputLabel>
          <Select
            value={selectedProjectId}
            label="Filter by Project"
            onChange={(e) => setSelectedProjectId(e.target.value)}
          >
            <MenuItem value="all">All Projects</MenuItem>
            {projects.map(p => (
              <MenuItem key={p.id} value={p.id}>{p.title}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Kanban Board */}
      <DragDropContext onDragEnd={onDragEnd}>
        <Box sx={{ display: 'flex', gap: 1.5, flexGrow: 1, overflowX: 'auto', pb: 2 }}>
          {COLUMNS.map(columnId => {
            const columnTasks = filteredTasks.filter(t => t.status === columnId);
            const accent      = COLUMN_COLORS[columnId];
            return (
              <Box key={columnId} sx={{ minWidth: 210, flex: 1, display: 'flex', flexDirection: 'column' }}>
                {/* Column Header */}
                <Paper sx={{
                  px: 2, py: 1.2, mb: 1.5,
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  borderTop: `3px solid ${accent}`,
                  borderRadius: '0 0 4px 4px',
                }}>
                  <Typography variant="subtitle2" sx={{ color: accent }}>{columnId}</Typography>
                  <Chip
                    label={columnTasks.length}
                    size="small"
                    sx={{ height: 20, fontSize: '0.7rem', bgcolor: `${accent}15`, color: accent, fontWeight: 700, borderRadius: 1 }}
                  />
                </Paper>

                {/* Droppable Area */}
                <Droppable droppableId={columnId}>
                  {(provided, snapshot) => (
                    <Box
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      sx={{
                        flexGrow: 1,
                        bgcolor: snapshot.isDraggingOver ? '#f1f5f9' : 'transparent',
                        borderRadius: 1.5,
                        minHeight: 120,
                        transition: 'background-color 0.15s ease',
                        p: 0.5,
                      }}
                    >
                      {columnTasks.map((task, index) => (
                        <Draggable key={task.id} draggableId={task.id} index={index}>
                          {(provided, snapshot) => (
                            <Paper
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              sx={{
                                p: 1.5,
                                mb: 1.5,
                                borderRadius: 1.5,
                                cursor: 'grab',
                                boxShadow: snapshot.isDragging
                                  ? '0 4px 16px rgba(0,0,0,0.12)'
                                  : '0 1px 3px rgba(0,0,0,0.06)',
                                borderLeft: `3px solid ${accent}`,
                                border: `1px solid rgba(0,0,0,0.07)`,
                                borderLeftColor: accent,
                                bgcolor: '#fff',
                                '&:active': { cursor: 'grabbing' },
                              }}
                            >
                              {/* Reference image thumbnail */}
                              {task.referenceImage && (
                                <Box sx={{ width: '100%', height: 90, mb: 1, borderRadius: 1, overflow: 'hidden', border: '1px solid #f1f5f9' }}>
                                  <img
                                    src={task.referenceImage}
                                    alt="ref"
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                  />
                                </Box>
                              )}

                              <Typography variant="subtitle2" sx={{ lineHeight: 1.4, mb: 1.5 }}>
                                {task.title}
                              </Typography>

                              {/* Project */}
                              {(() => {
                                const proj = projects.find(p => p.id === task.projectId);
                                return proj ? (
                                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                                    {proj.title}
                                  </Typography>
                                ) : null;
                              })()}

                              {/* Footer row */}
                              {(() => {
                                const emp = resolveEmployee(task);
                                return (
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Tooltip title={emp?.name || 'Unassigned'}>
                                  <Avatar
                                    src={emp?.profileImage}
                                    sx={{ width: 24, height: 24, fontSize: '0.65rem' }}
                                  />
                                </Tooltip>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4, color: 'text.secondary' }}>
                                  <TimeIcon sx={{ fontSize: 13 }} />
                                  <Typography variant="caption">{format(new Date(task.eta), 'MMM dd')}</Typography>
                                </Box>
                              </Box>
                                );
                              })()}
                            </Paper>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </Box>
                  )}
                </Droppable>
              </Box>
            );
          })}
        </Box>
      </DragDropContext>
    </Box>
  );
}
