import { configureStore } from '@reduxjs/toolkit';
import employeesReducer from '../features/employees/employeesSlice';
import projectsReducer from '../features/projects/projectsSlice';
import tasksReducer from '../features/tasks/tasksSlice';

export const store = configureStore({
  reducer: {
    employees: employeesReducer,
    projects: projectsReducer,
    tasks: tasksReducer,
  },
});
