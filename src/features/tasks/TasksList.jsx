import { useState, useMemo, forwardRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box, Typography, Button, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Avatar, IconButton, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Divider, InputAdornment, Chip, Stack, Tooltip,
  Autocomplete, FormControl, InputLabel, Select, MenuItem, FormHelperText, Slide,
} from '@mui/material';
import {
  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Visibility as VisibilityIcon,
  Close as CloseIcon, Task as TaskIcon, Description as DescIcon,
  AccessTime as EtaIcon, Person as PersonIcon, Work as WorkIcon,
  AssignmentTurnedIn as StatusIcon, FolderOpen as ProjectFolderIcon,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { v4 as uuidv4 } from 'uuid';
import { addTask, updateTask, deleteTask } from './tasksSlice';
import { format } from 'date-fns';
import ImageUrlInput from '../../components/ImageUrlInput';

const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const STATUS_OPTIONS = ['Need to Do', 'In Progress', 'Need for Test', 'Completed', 'Re-open'];

const STATUS_COLORS = {
  'Completed':     'success',
  'In Progress':   'primary',
  'Need for Test': 'warning',
  'Re-open':       'error',
  'Need to Do':    'default',
};

const schema = yup.object({
  title:            yup.string().required('Task Title is required'),
  description:      yup.string().required('Description is required'),
  projectId:        yup.string().required('Project must be linked'),
  assignedEmployee: yup.object().required('Employee must be assigned').nullable(),
  eta:              yup.date().required('ETA is required').typeError('Valid date required'),
  referenceImage:   yup.string().required('Reference Image is required'),
  status:           yup.string().required('Status is required'),
}).required();

export default function TasksList() {
  const tasks     = useSelector((state) => state.tasks.list);
  const projects  = useSelector((state) => state.projects.list);
  const employees = useSelector((state) => state.employees.list);
  const dispatch  = useDispatch();

  const [open, setOpen]                 = useState(false);
  const [viewOpen, setViewOpen]         = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isEdit, setIsEdit]             = useState(false);

  const { register, handleSubmit, control, reset, watch, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { projectId: '', assignedEmployee: null, status: 'Need to Do' },
  });

  const watchProjectId = watch('projectId');

  // Get employees assigned to the selected project (using stored IDs)
  const availableEmployees = useMemo(() => {
    if (!watchProjectId) return [];
    const proj = projects.find(p => p.id === watchProjectId);
    if (!proj) return [];
    const ids = proj.assignedEmployeeIds || [];
    return ids.map(id => employees.find(e => e.id === id)).filter(Boolean);
  }, [watchProjectId, projects, employees]);

  // Resolve a task's stored employeeId → full employee object
  const resolveEmployee = (task) =>
    task.assignedEmployeeId
      ? employees.find(e => e.id === task.assignedEmployeeId) || null
      : null;

  const handleOpen = (task = null) => {
    if (task) {
      setIsEdit(true);
      setSelectedTask(task);
      reset({
        ...task,
        eta: new Date(task.eta).toISOString().slice(0, 16),
        // Convert stored ID back to full object for the form
        assignedEmployee: resolveEmployee(task),
      });
    } else {
      setIsEdit(false);
      setSelectedTask(null);
      reset({ title: '', description: '', projectId: '', assignedEmployee: null, eta: '', referenceImage: '', status: 'Need to Do' });
    }
    setOpen(true);
  };

  const handleClose = () => { setOpen(false); reset(); };

  const onSubmit = (data) => {
    const payload = {
      ...data,
      eta: new Date(data.eta).toISOString(),
      // Store only the employee ID (not the full object) to stay within localStorage limits
      assignedEmployeeId: data.assignedEmployee?.id || null,
      assignedEmployee: undefined,
    };
    if (isEdit) dispatch(updateTask({ ...selectedTask, ...payload }));
    else dispatch(addTask({ ...payload, id: uuidv4() }));
    handleClose();
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete this task?')) dispatch(deleteTask(id));
  };

  return (
    <Box>
      {/* ── Page Header ── */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4">Tasks</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {tasks.length} task{tasks.length !== 1 ? 's' : ''} in total
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen()}>
          Add Task
        </Button>
      </Box>

      {projects.length === 0 && (
        <Paper sx={{ p: 2, mb: 3, bgcolor: '#fefce8', border: '1px solid #fde68a', borderRadius: 1.5 }}>
          <Typography variant="body2" color="warning.dark" fontWeight={500}>
            ⚠️ You need to create a project and assign employees before adding tasks.
          </Typography>
        </Paper>
      )}

      {/* ── Table ── */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Task</TableCell>
              <TableCell>Ref Image</TableCell>
              <TableCell>Project</TableCell>
              <TableCell>Assigned To</TableCell>
              <TableCell>ETA</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tasks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                  <TaskIcon sx={{ fontSize: 40, opacity: 0.2, display: 'block', mx: 'auto', mb: 1 }} />
                  No tasks yet. Add one to get started.
                </TableCell>
              </TableRow>
            ) : (
              tasks.map((task) => {
                const project  = projects.find(p => p.id === task.projectId);
                const employee = resolveEmployee(task);
                return (
                  <TableRow key={task.id}>
                    <TableCell>
                      <Typography variant="subtitle2">{task.title}</Typography>
                    </TableCell>
                    <TableCell>
                      {task.referenceImage ? (
                        <Box
                          component="img"
                          src={task.referenceImage}
                          alt="ref"
                          sx={{
                            width: 48, height: 48,
                            objectFit: 'cover',
                            borderRadius: 1,
                            border: '1px solid #e2e8f0',
                            display: 'block',
                          }}
                        />
                      ) : (
                        <Typography variant="caption" color="text.secondary">—</Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip label={project?.title || 'Unknown'} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>
                      {employee ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar src={employee.profileImage} sx={{ width: 26, height: 26 }} />
                          <Typography variant="body2">{employee.name}</Typography>
                        </Box>
                      ) : (
                        <Typography variant="caption" color="text.secondary">—</Typography>
                      )}
                    </TableCell>
                    <TableCell sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>
                      {format(new Date(task.eta), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell>
                      <Chip label={task.status} size="small" color={STATUS_COLORS[task.status] || 'default'} />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="View"><IconButton size="small" onClick={() => { setSelectedTask(task); setViewOpen(true); }}><VisibilityIcon fontSize="small" /></IconButton></Tooltip>
                      <Tooltip title="Edit"><IconButton size="small" color="primary" onClick={() => handleOpen(task)}><EditIcon fontSize="small" /></IconButton></Tooltip>
                      <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => handleDelete(task.id)}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* ── Add / Edit Dialog ── */}
      <Dialog open={open} onClose={handleClose} TransitionComponent={Transition} maxWidth="sm" fullWidth
        PaperProps={{ sx: { borderRadius: 2 } }}>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
          <Box>
            <Typography variant="h6">{isEdit ? 'Edit Task' : 'Add Task'}</Typography>
            <Typography variant="caption" color="text.secondary">
              {isEdit ? 'Update task details and assignment' : 'Fill in task details and assign to a team member'}
            </Typography>
          </Box>
          <IconButton size="small" onClick={handleClose}><CloseIcon fontSize="small" /></IconButton>
        </DialogTitle>

        <Divider />

        <DialogContent>
          <Box component="form" id="task-form" onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={2.5}>
              <TextField
                label="Task Title" fullWidth
                {...register('title')} error={!!errors.title} helperText={errors.title?.message}
                placeholder="e.g. Design Homepage Banner"
                InputProps={{ startAdornment: <InputAdornment position="start"><TaskIcon sx={{ fontSize: 18, color: 'text.secondary' }} /></InputAdornment> }}
              />
              <TextField
                label="Description" fullWidth multiline rows={2}
                {...register('description')} error={!!errors.description} helperText={errors.description?.message}
                placeholder="Describe what needs to be done..."
                InputProps={{ startAdornment: <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1 }}><DescIcon sx={{ fontSize: 18, color: 'text.secondary' }} /></InputAdornment> }}
              />
              <Controller
                name="status" control={control}
                render={({ field }) => (
                  <FormControl fullWidth size="small" error={!!errors.status}>
                    <InputLabel>Status</InputLabel>
                    <Select {...field} label="Status">
                      {STATUS_OPTIONS.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                    </Select>
                    <FormHelperText>{errors.status?.message}</FormHelperText>
                  </FormControl>
                )}
              />

              <Divider />

              <Controller
                name="projectId" control={control}
                render={({ field }) => (
                  <FormControl fullWidth size="small" error={!!errors.projectId}>
                    <InputLabel>Linked Project</InputLabel>
                    <Select
                      {...field} label="Linked Project"
                      onChange={(e) => {
                        field.onChange(e);
                        reset({ ...watch(), projectId: e.target.value, assignedEmployee: null });
                      }}
                    >
                      {projects.map(p => (
                        <MenuItem key={p.id} value={p.id}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar src={p.logo} variant="rounded" sx={{ width: 20, height: 20, borderRadius: 0.5 }} />
                            {p.title}
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                    <FormHelperText>{errors.projectId?.message}</FormHelperText>
                  </FormControl>
                )}
              />

              <Controller
                name="assignedEmployee" control={control}
                render={({ field }) => (
                  <Autocomplete
                    {...field}
                    options={availableEmployees}
                    getOptionLabel={(o) => o.name || ''}
                    isOptionEqualToValue={(o, v) => o.id === v?.id}
                    onChange={(_, data) => field.onChange(data)}
                    disabled={!watchProjectId}
                    renderInput={(params) => (
                      <TextField {...params} label="Assign To" size="small"
                        error={!!errors.assignedEmployee}
                        helperText={!watchProjectId ? 'Select a project first' : errors.assignedEmployee?.message} />
                    )}
                    renderOption={(props, option) => (
                      <li {...props}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar src={option.profileImage} sx={{ width: 28, height: 28 }} />
                          <Box>
                            <Typography variant="body2" fontWeight={600}>{option.name}</Typography>
                            <Typography variant="caption" color="text.secondary">{option.position}</Typography>
                          </Box>
                        </Box>
                      </li>
                    )}
                  />
                )}
              />

              <Divider />

              <TextField
                label="ETA" type="datetime-local" fullWidth InputLabelProps={{ shrink: true }}
                {...register('eta')} error={!!errors.eta} helperText={errors.eta?.message}
              />
              <Controller
                name="referenceImage" control={control}
                render={({ field }) => (
                  <ImageUrlInput
                    value={field.value} onChange={field.onChange}
                    label="Reference Image" variant="rounded"
                    error={!!errors.referenceImage}
                    helperText={errors.referenceImage?.message || 'Upload a reference/mockup image for this task'}
                  />
                )}
              />
            </Stack>
          </Box>
        </DialogContent>

        <Divider />
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button variant="outlined" color="inherit" onClick={handleClose}>Cancel</Button>
          <Button variant="contained" type="submit" form="task-form">
            {isEdit ? 'Save Changes' : 'Create Task'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── View Dialog ── */}
      <Dialog open={viewOpen} onClose={() => setViewOpen(false)} maxWidth="xs" fullWidth TransitionComponent={Transition}
        PaperProps={{ sx: { borderRadius: 2 } }}>
        {selectedTask && (() => {
          const project  = projects.find(p => p.id === selectedTask.projectId);
          const employee = resolveEmployee(selectedTask);
          return (
            <>
              <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="h6" sx={{ lineHeight: 1.3 }}>{selectedTask.title}</Typography>
                  <Chip label={selectedTask.status} size="small" color={STATUS_COLORS[selectedTask.status] || 'default'} sx={{ mt: 0.5 }} />
                </Box>
                <IconButton size="small" onClick={() => setViewOpen(false)}><CloseIcon fontSize="small" /></IconButton>
              </DialogTitle>
              <Divider />
              <DialogContent>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="caption" color="text.secondary"
                      sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', mb: 0.5 }}>
                      Description
                    </Typography>
                    <Typography variant="body2">{selectedTask.description}</Typography>
                  </Box>
                  <Divider />
                  {[
                    { label: 'Project', value: project?.title || 'Unknown' },
                    { label: 'ETA',     value: format(new Date(selectedTask.eta), 'PPp') },
                  ].map(item => (
                    <Box key={item.label} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="caption" color="text.secondary"
                        sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        {item.label}
                      </Typography>
                      <Typography variant="body2" fontWeight={500}>{item.value}</Typography>
                    </Box>
                  ))}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" color="text.secondary"
                      sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Assigned To
                    </Typography>
                    {employee ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar src={employee.profileImage} sx={{ width: 24, height: 24 }} />
                        <Typography variant="body2" fontWeight={500}>{employee.name}</Typography>
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">—</Typography>
                    )}
                  </Box>
                  {selectedTask.referenceImage && (
                    <>
                      <Divider />
                      <Box>
                        <Typography variant="caption" color="text.secondary"
                          sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', mb: 1 }}>
                          Reference Image
                        </Typography>
                        <img src={selectedTask.referenceImage} alt="Reference"
                          style={{ width: '100%', borderRadius: 6, border: '1px solid #e2e8f0' }} />
                      </Box>
                    </>
                  )}
                </Stack>
              </DialogContent>
              <Divider />
              <DialogActions sx={{ px: 3, py: 2 }}>
                <Button fullWidth variant="outlined" onClick={() => setViewOpen(false)}>Close</Button>
              </DialogActions>
            </>
          );
        })()}
      </Dialog>
    </Box>
  );
}
