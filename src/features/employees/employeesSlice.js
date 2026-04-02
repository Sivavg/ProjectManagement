import { createSlice } from '@reduxjs/toolkit';
import { saveImg, loadImg, removeImg } from '../../utils/imageStore';

const KEY = 'employees';

const loadState = () => {
  try {
    const data = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (!data) return [];
    // Re-attach profile images from separate storage
    return data.map(emp => ({
      ...emp,
      profileImage: loadImg('emp_' + emp.id),
    }));
  } catch {
    return [];
  }
};

const saveState = (list) => {
  try {
    // Strip images before saving main list
    const stripped = list.map(({ profileImage, ...rest }) => rest);
    localStorage.setItem(KEY, JSON.stringify(stripped));
    // Save each image separately
    list.forEach(emp => saveImg('emp_' + emp.id, emp.profileImage));
  } catch (e) { /* ignore */ }
};

const initialState = { list: loadState() };

const employeesSlice = createSlice({
  name: 'employees',
  initialState,
  reducers: {
    addEmployee: (state, action) => {
      state.list.push(action.payload);
      saveState(state.list);
    },
    updateEmployee: (state, action) => {
      const index = state.list.findIndex(e => e.id === action.payload.id);
      if (index !== -1) {
        state.list[index] = action.payload;
        saveState(state.list);
      }
    },
    deleteEmployee: (state, action) => {
      removeImg('emp_' + action.payload);
      state.list = state.list.filter(e => e.id !== action.payload);
      saveState(state.list);
    },
  },
});

export const { addEmployee, updateEmployee, deleteEmployee } = employeesSlice.actions;
export default employeesSlice.reducer;
