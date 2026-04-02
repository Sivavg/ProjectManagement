import { createSlice } from '@reduxjs/toolkit';
import { saveImg, loadImg, removeImg } from '../../utils/imageStore';

const KEY = 'projects';

const loadState = () => {
  try {
    const data = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (!data) return [];
    // Re-attach logos from separate storage
    return data.map(proj => ({
      ...proj,
      logo: loadImg('proj_' + proj.id),
    }));
  } catch {
    return [];
  }
};

const saveState = (list) => {
  try {
    // Strip logo before saving main list
    const stripped = list.map(({ logo, ...rest }) => rest);
    localStorage.setItem(KEY, JSON.stringify(stripped));
    // Save each logo separately
    list.forEach(proj => saveImg('proj_' + proj.id, proj.logo));
  } catch (e) { /* ignore */ }
};

const initialState = { list: loadState() };

const projectsSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    addProject: (state, action) => {
      state.list.push(action.payload);
      saveState(state.list);
    },
    updateProject: (state, action) => {
      const index = state.list.findIndex(p => p.id === action.payload.id);
      if (index !== -1) {
        state.list[index] = action.payload;
        saveState(state.list);
      }
    },
    deleteProject: (state, action) => {
      removeImg('proj_' + action.payload);
      state.list = state.list.filter(p => p.id !== action.payload);
      saveState(state.list);
    },
  },
});

export const { addProject, updateProject, deleteProject } = projectsSlice.actions;
export default projectsSlice.reducer;
