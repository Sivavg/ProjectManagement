import { createSlice } from '@reduxjs/toolkit';
import { saveImg, loadImg, removeImg } from '../../utils/imageStore';

const KEY = 'tasks';

const loadState = () => {
  try {
    const data = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (!data) return [];
    // Re-attach reference images from separate storage
    return data.map(task => ({
      ...task,
      referenceImage: loadImg('task_' + task.id),
    }));
  } catch {
    return [];
  }
};

const saveState = (list) => {
  try {
    // Strip referenceImage before saving main list
    const stripped = list.map(({ referenceImage, ...rest }) => rest);
    localStorage.setItem(KEY, JSON.stringify(stripped));
    // Save each reference image separately
    list.forEach(task => saveImg('task_' + task.id, task.referenceImage));
  } catch (e) { /* ignore */ }
};

const initialState = { list: loadState() };

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    addTask: (state, action) => {
      state.list.push({
        ...action.payload,
        status: action.payload.status || 'Need to Do',
      });
      saveState(state.list);
    },
    updateTask: (state, action) => {
      const index = state.list.findIndex(t => t.id === action.payload.id);
      if (index !== -1) {
        state.list[index] = { ...state.list[index], ...action.payload };
        saveState(state.list);
      }
    },
    updateTaskStatus: (state, action) => {
      const { id, status } = action.payload;
      const index = state.list.findIndex(t => t.id === id);
      if (index !== -1) {
        state.list[index].status = status;
        saveState(state.list);
      }
    },
    deleteTask: (state, action) => {
      removeImg('task_' + action.payload);
      state.list = state.list.filter(t => t.id !== action.payload);
      saveState(state.list);
    },
  },
});

export const { addTask, updateTask, updateTaskStatus, deleteTask } = tasksSlice.actions;
export default tasksSlice.reducer;
