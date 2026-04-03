import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './features/dashboard/Dashboard';
import EmployeesList from './features/employees/EmployeesList';
import ProjectsList from './features/projects/ProjectsList';
import ProjectDetail from './features/projects/ProjectDetail';
import TasksList from './features/tasks/TasksList';
import { Box, Typography } from '@mui/material';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />

          <Route path="employees">
            <Route index element={<EmployeesList />} />
          </Route>

          <Route path="projects">
            <Route index element={<ProjectsList />} />
            <Route path=":id" element={<ProjectDetail />} />
          </Route>

          <Route path="tasks">
            <Route index element={<TasksList />} />
          </Route>

          <Route path="*" element={
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h4">404 - Page Not Found</Typography>
            </Box>
          } />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
