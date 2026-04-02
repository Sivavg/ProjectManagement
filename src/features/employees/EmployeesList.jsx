import { useState, forwardRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box, Typography, Button, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Avatar, IconButton, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Divider, InputAdornment, Chip, Stack, Tooltip, Slide,
} from '@mui/material';
import {
  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Visibility as VisibilityIcon,
  Person as PersonIcon, Work as WorkIcon, Close as CloseIcon,
  AlternateEmail as AtIcon,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import ImageUrlInput from '../../components/ImageUrlInput';
import * as yup from 'yup';
import { v4 as uuidv4 } from 'uuid';
import { addEmployee, updateEmployee, deleteEmployee } from './employeesSlice';

const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const schema = yup.object({
  name:         yup.string().required('Name is required'),
  position:     yup.string().required('Position is required'),
  email:        yup.string().email('Must be a valid email').required('Email is required'),
  profileImage: yup.string().required('Profile Image URL is required'),
}).required();

export default function EmployeesList() {
  const employees = useSelector((state) => state.employees.list);
  const dispatch  = useDispatch();

  const [open, setOpen]           = useState(false);
  const [viewOpen, setViewOpen]   = useState(false);
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [isEdit, setIsEdit]       = useState(false);

  const { register, handleSubmit, reset, control, formState: { errors }, setError } = useForm({
    resolver: yupResolver(schema),
  });

  const handleOpen = (employee = null) => {
    if (employee) {
      setIsEdit(true);
      setSelectedEmp(employee);
      reset(employee);
    } else {
      setIsEdit(false);
      setSelectedEmp(null);
      reset({ name: '', position: '', email: '', profileImage: '' });
    }
    setOpen(true);
  };

  const handleClose = () => { setOpen(false); reset(); };

  const handleView = (employee) => { setSelectedEmp(employee); setViewOpen(true); };

  const onSubmit = (data) => {
    const emailExists = employees.find(e => e.email === data.email && e.id !== selectedEmp?.id);
    if (emailExists) {
      setError('email', { type: 'manual', message: 'This email is already registered.' });
      return;
    }
    if (isEdit) dispatch(updateEmployee({ ...selectedEmp, ...data }));
    else dispatch(addEmployee({ ...data, id: uuidv4() }));
    handleClose();
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete this employee?')) dispatch(deleteEmployee(id));
  };

  return (
    <Box>
      {/* ── Page Header ── */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4">Employees</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {employees.length} team member{employees.length !== 1 ? 's' : ''}
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen()}>
          Add Employee
        </Button>
      </Box>

      {/* ── Table ── */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Employee</TableCell>
              <TableCell>Position</TableCell>
              <TableCell>Email</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {employees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                  <PersonIcon sx={{ fontSize: 40, opacity: 0.2, display: 'block', mx: 'auto', mb: 1 }} />
                  No employees yet. Click "Add Employee" to get started.
                </TableCell>
              </TableRow>
            ) : (
              employees.map((emp) => (
                <TableRow key={emp.id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar src={emp.profileImage} alt={emp.name} sx={{ width: 36, height: 36 }} />
                      <Typography variant="subtitle2">{emp.name}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip label={emp.position} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell sx={{ color: 'text.secondary' }}>{emp.email}</TableCell>
                  <TableCell align="right">
                    <Tooltip title="View"><IconButton size="small" onClick={() => handleView(emp)}><VisibilityIcon fontSize="small" /></IconButton></Tooltip>
                    <Tooltip title="Edit"><IconButton size="small" color="primary" onClick={() => handleOpen(emp)}><EditIcon fontSize="small" /></IconButton></Tooltip>
                    <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => handleDelete(emp.id)}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* ── Add / Edit Dialog ── */}
      <Dialog open={open} onClose={handleClose} TransitionComponent={Transition} maxWidth="sm" fullWidth
        PaperProps={{ sx: { borderRadius: 2 } }}>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
          <Box>
            <Typography variant="h6">{isEdit ? 'Edit Employee' : 'Add Employee'}</Typography>
            <Typography variant="caption" color="text.secondary">
              {isEdit ? 'Update employee information' : 'Fill in the details to add a new team member'}
            </Typography>
          </Box>
          <IconButton size="small" onClick={handleClose}><CloseIcon fontSize="small" /></IconButton>
        </DialogTitle>

        <Divider />

        <DialogContent>
          <Box component="form" id="emp-form" onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={2.5}>
              <TextField
                label="Full Name"
                fullWidth
                {...register('name')}
                error={!!errors.name}
                helperText={errors.name?.message}
                placeholder="e.g. Aisha Fernandez"
                InputProps={{ startAdornment: <InputAdornment position="start"><PersonIcon sx={{ fontSize: 18, color: 'text.secondary' }} /></InputAdornment> }}
              />
              <TextField
                label="Position / Role"
                fullWidth
                {...register('position')}
                error={!!errors.position}
                helperText={errors.position?.message}
                placeholder="e.g. Senior UI Designer"
                InputProps={{ startAdornment: <InputAdornment position="start"><WorkIcon sx={{ fontSize: 18, color: 'text.secondary' }} /></InputAdornment> }}
              />
              <TextField
                label="Email Address"
                fullWidth
                {...register('email')}
                error={!!errors.email}
                helperText={errors.email?.message}
                placeholder="e.g. aisha@company.com"
                InputProps={{ startAdornment: <InputAdornment position="start"><AtIcon sx={{ fontSize: 18, color: 'text.secondary' }} /></InputAdornment> }}
              />
              <Controller
                name="profileImage"
                control={control}
                render={({ field }) => (
                  <ImageUrlInput
                    value={field.value}
                    onChange={field.onChange}
                    label="Profile Photo URL"
                    variant="avatar"
                    error={!!errors.profileImage}
                    helperText={errors.profileImage?.message}
                  />
                )}
              />
            </Stack>
          </Box>
        </DialogContent>

        <Divider />
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button variant="outlined" color="inherit" onClick={handleClose}>Cancel</Button>
          <Button variant="contained" type="submit" form="emp-form">
            {isEdit ? 'Save Changes' : 'Add Employee'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── View Dialog ── */}
      <Dialog open={viewOpen} onClose={() => setViewOpen(false)} maxWidth="xs" fullWidth TransitionComponent={Transition}
        PaperProps={{ sx: { borderRadius: 2 } }}>
        {selectedEmp && (
          <>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">Employee Profile</Typography>
              <IconButton size="small" onClick={() => setViewOpen(false)}><CloseIcon fontSize="small" /></IconButton>
            </DialogTitle>
            <Divider />
            <DialogContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3, pt: 1 }}>
                <Avatar
                  src={selectedEmp.profileImage}
                  sx={{ width: 72, height: 72, mb: 1.5, fontSize: 28 }}
                >
                  {selectedEmp.name[0]}
                </Avatar>
                <Typography variant="subtitle1">{selectedEmp.name}</Typography>
                <Typography variant="body2" color="text.secondary">{selectedEmp.position}</Typography>
              </Box>
              <Stack spacing={1.5}>
                {[
                  { label: 'Full Name', value: selectedEmp.name },
                  { label: 'Position', value: selectedEmp.position },
                  { label: 'Email', value: selectedEmp.email },
                ].map((item) => (
                  <Box key={item.label} sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: '1px solid #f1f5f9' }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      {item.label}
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>{item.value}</Typography>
                  </Box>
                ))}
              </Stack>
            </DialogContent>
            <Divider />
            <DialogActions sx={{ px: 3, py: 2 }}>
              <Button fullWidth variant="outlined" onClick={() => setViewOpen(false)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}
