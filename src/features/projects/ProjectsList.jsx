import { useState, forwardRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Avatar, IconButton, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Divider, InputAdornment, Chip, Stack, Tooltip,
  Autocomplete, Slide,
} from '@mui/material';
import {
  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Visibility as VisibilityIcon,
  Close as CloseIcon, BusinessCenter as ProjectIcon, Description as DescIcon,
  CalendarToday as CalIcon, DateRange as DateIcon,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { v4 as uuidv4 } from 'uuid';
import { addProject, updateProject, deleteProject } from './projectsSlice';
import { format } from 'date-fns';
import ImageUrlInput from '../../components/ImageUrlInput';

const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const schema = yup.object({
  title:             yup.string().required('Project Title is required'),
  description:       yup.string().required('Description is required'),
  logo:              yup.string().required('Project Logo is required'),
  startDate:         yup.date().required('Start date is required').typeError('Valid start date required'),
  endDate:           yup.date().min(yup.ref('startDate'), 'End date must be after Start date').required('End date is required').typeError('Valid end date required'),
  assignedEmployees: yup.array().min(1, 'Assign at least one employee').required(),
}).required();

export default function ProjectsList() {
  const projects  = useSelector((state) => state.projects.list);
  const employees = useSelector((state) => state.employees.list);
  const dispatch  = useDispatch();
  const navigate  = useNavigate();

  const [open, setOpen]                 = useState(false);
  const [viewOpen, setViewOpen]         = useState(false);
  const [selectedProj, setSelectedProj] = useState(null);
  const [isEdit, setIsEdit]             = useState(false);

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { assignedEmployees: [] },
  });

  // Resolve employee IDs → full employee objects from Redux
  const resolveEmployees = (ids = []) =>
    ids.map(id => employees.find(e => e.id === id)).filter(Boolean);

  const handleOpen = (project = null) => {
    if (project) {
      setIsEdit(true);
      setSelectedProj(project);
      reset({
        ...project,
        startDate: new Date(project.startDate).toISOString().slice(0, 16),
        endDate:   new Date(project.endDate).toISOString().slice(0, 16),
        // Convert stored IDs back to full objects for the form
        assignedEmployees: resolveEmployees(project.assignedEmployeeIds),
      });
    } else {
      setIsEdit(false);
      setSelectedProj(null);
      reset({ title: '', description: '', logo: '', startDate: '', endDate: '', assignedEmployees: [] });
    }
    setOpen(true);
  };

  const handleClose = () => { setOpen(false); reset(); };

  const onSubmit = (data) => {
    const payload = {
      ...data,
      startDate: new Date(data.startDate).toISOString(),
      endDate:   new Date(data.endDate).toISOString(),
      // Store only employee IDs (not full objects) to keep localStorage small
      assignedEmployeeIds: data.assignedEmployees.map(e => e.id),
      assignedEmployees: undefined, // don't store full objects
    };
    if (isEdit) dispatch(updateProject({ ...selectedProj, ...payload }));
    else dispatch(addProject({ ...payload, id: uuidv4() }));
    handleClose();
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete this project? Tasks linked to it may be affected.')) dispatch(deleteProject(id));
  };

  return (
    <Box>
      {/* ── Page Header ── */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4">Projects</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {projects.length} project{projects.length !== 1 ? 's' : ''}
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen()}>
          New Project
        </Button>
      </Box>

      {/* ── Table ── */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Project</TableCell>
              <TableCell>Duration</TableCell>
              <TableCell>Team</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {projects.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                  <ProjectIcon sx={{ fontSize: 40, opacity: 0.2, display: 'block', mx: 'auto', mb: 1 }} />
                  No projects yet. Click "New Project" to get started.
                </TableCell>
              </TableRow>
            ) : (
              projects.map((proj) => {
                const teamMembers = resolveEmployees(proj.assignedEmployeeIds);
                return (
                  <TableRow key={proj.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar src={proj.logo} alt={proj.title} variant="rounded" sx={{ width: 36, height: 36, borderRadius: 1 }} />
                        <Box>
                          <Typography variant="subtitle2">{proj.title}</Typography>
                          <Typography variant="caption" color="text.secondary"
                            sx={{ display: 'block', mt: 0.2, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {proj.description}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>
                      {format(new Date(proj.startDate), 'MMM dd, yyyy')} — {format(new Date(proj.endDate), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
                        {teamMembers.slice(0, 3).map(emp => (
                          <Box key={emp.id} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar src={emp.profileImage} alt={emp.name} sx={{ width: 24, height: 24, fontSize: '0.65rem' }} />
                            <Typography variant="caption" fontWeight={500}>{emp.name}</Typography>
                          </Box>
                        ))}
                        {teamMembers.length > 3 && (
                          <Typography variant="caption" color="text.secondary">
                            +{teamMembers.length - 3} more
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="View Details"><IconButton size="small" onClick={() => navigate(`/projects/${proj.id}`)}><VisibilityIcon fontSize="small" /></IconButton></Tooltip>
                      <Tooltip title="Edit"><IconButton size="small" color="primary" onClick={() => handleOpen(proj)}><EditIcon fontSize="small" /></IconButton></Tooltip>
                      <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => handleDelete(proj.id)}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
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
            <Typography variant="h6">{isEdit ? 'Edit Project' : 'New Project'}</Typography>
            <Typography variant="caption" color="text.secondary">
              {isEdit ? 'Update the project details' : 'Set up a new project and assign your team'}
            </Typography>
          </Box>
          <IconButton size="small" onClick={handleClose}><CloseIcon fontSize="small" /></IconButton>
        </DialogTitle>

        <Divider />

        <DialogContent>
          <Box component="form" id="proj-form" onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={2.5}>
              <TextField
                label="Project Title" fullWidth
                {...register('title')} error={!!errors.title} helperText={errors.title?.message}
                placeholder="e.g. Website Redesign"
                InputProps={{ startAdornment: <InputAdornment position="start"><ProjectIcon sx={{ fontSize: 18, color: 'text.secondary' }} /></InputAdornment> }}
              />
              <Controller
                name="logo" control={control}
                render={({ field }) => (
                  <ImageUrlInput value={field.value} onChange={field.onChange}
                    label="Project Logo" variant="rounded"
                    error={!!errors.logo} helperText={errors.logo?.message} />
                )}
              />
              <TextField
                label="Description" fullWidth multiline rows={2}
                {...register('description')} error={!!errors.description} helperText={errors.description?.message}
                placeholder="What is this project about?"
                InputProps={{ startAdornment: <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1 }}><DescIcon sx={{ fontSize: 18, color: 'text.secondary' }} /></InputAdornment> }}
              />

              <Divider />

              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField label="Start Date" type="datetime-local" fullWidth InputLabelProps={{ shrink: true }}
                  {...register('startDate')} error={!!errors.startDate} helperText={errors.startDate?.message} />
                <TextField label="End Date" type="datetime-local" fullWidth InputLabelProps={{ shrink: true }}
                  {...register('endDate')} error={!!errors.endDate} helperText={errors.endDate?.message} />
              </Box>

              <Divider />

              <Controller
                name="assignedEmployees" control={control}
                render={({ field }) => (
                  <Autocomplete
                    {...field} multiple options={employees}
                    getOptionLabel={(o) => o.name}
                    isOptionEqualToValue={(o, v) => o.id === v.id}
                    onChange={(_, data) => field.onChange(data)}
                    renderInput={(params) => (
                      <TextField {...params} label="Assign Team Members"
                        error={!!errors.assignedEmployees}
                        helperText={errors.assignedEmployees?.message || 'Members assigned here can be given tasks in this project'} />
                    )}
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => (
                        <Chip avatar={<Avatar src={option.profileImage} />} label={option.name}
                          {...getTagProps({ index })} key={option.id} size="small" />
                      ))
                    }
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
            </Stack>
          </Box>
        </DialogContent>

        <Divider />
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button variant="outlined" color="inherit" onClick={handleClose}>Cancel</Button>
          <Button variant="contained" type="submit" form="proj-form">
            {isEdit ? 'Save Changes' : 'Create Project'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── View Dialog ── */}
      <Dialog open={viewOpen} onClose={() => setViewOpen(false)} maxWidth="sm" fullWidth TransitionComponent={Transition}
        PaperProps={{ sx: { borderRadius: 2 } }}>
        {selectedProj && (() => {
          const teamMembers = resolveEmployees(selectedProj.assignedEmployeeIds);
          return (
            <>
              <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Avatar src={selectedProj.logo} variant="rounded" sx={{ width: 40, height: 40, borderRadius: 1 }}>
                    {selectedProj.title[0]}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" sx={{ lineHeight: 1.3 }}>{selectedProj.title}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {format(new Date(selectedProj.startDate), 'MMM dd, yyyy')} — {format(new Date(selectedProj.endDate), 'MMM dd, yyyy')}
                    </Typography>
                  </Box>
                </Box>
                <IconButton size="small" onClick={() => setViewOpen(false)}><CloseIcon fontSize="small" /></IconButton>
              </DialogTitle>
              <Divider />
              <DialogContent>
                <Stack spacing={2.5}>
                  <Box>
                    <Typography variant="caption" color="text.secondary"
                      sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', mb: 0.5 }}>
                      Description
                    </Typography>
                    <Typography variant="body2">{selectedProj.description}</Typography>
                  </Box>
                  <Divider />
                  <Box>
                    <Typography variant="caption" color="text.secondary"
                      sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', mb: 1.5 }}>
                      Team ({teamMembers.length})
                    </Typography>
                    <Stack spacing={1}>
                      {teamMembers.map(emp => (
                        <Box key={emp.id} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 0.5 }}>
                          <Avatar src={emp.profileImage} sx={{ width: 32, height: 32 }} />
                          <Box>
                            <Typography variant="body2" fontWeight={600}>{emp.name}</Typography>
                            <Typography variant="caption" color="text.secondary">{emp.position}</Typography>
                          </Box>
                        </Box>
                      ))}
                    </Stack>
                  </Box>
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
