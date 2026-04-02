# ProManage - Project Management Dashboard

A modern, responsive, and intuitive Project Management Dashboard built with React, robust state management via Redux Toolkit, and fluid drag-and-drop capability for tasks.

## 🚀 Features

### Employee Management
- Complete CRUD operations for Employees.
- Tracks Name, Position, unique Email, and Profile Image.

### Project Management
- Complete CRUD operations for Projects.
- Attach specific teams (assigned employees) to projects.
- Validates timelines with Start and End Dates.
- Shows team sizes and durations.

### Task Management
- Create tasks linked dynamically to specific projects.
- Assign tasks exclusively to employees already part of that project.
- Tracks ETA and visual Reference Images.

### Interactive Task Board (Dashboard)
- Implements interactive Drag & Drop columns (`@hello-pangea/dnd`): Need to Do, In Progress, Need for Test, Completed, Re-open.
- Filter task views dynamically by Project.
- Visual cues with reference images, assigned avatars, and ETA timelines format.

## 🛠 Tech Stack
- **Frontend Framework:** React (Functional Components + Hooks, Vite)
- **Routing:** React Router v6
- **State Management:** Redux Toolkit (Persistent with localStorage)
- **Drag and Drop:** `@hello-pangea/dnd`
- **Form Handling:** React Hook Form
- **Form Validation:** Yup
- **UI Framework:** Material UI (MUI) v5
- **Icons:** Material Icons
- **Date Parsing:** `date-fns`
- **Unique IDs:** `uuid`

## ⚙️ Setup Instructions

### 1. Requirements
- Node.js (v16.0 or higher)
- npm or yarn

### 2. Installation
Clone the repository, navigate into the project directory, and install dependencies:

```bash
git clone <repository-url>
cd <project-directory>
npm install
```

### 3. Running the App
Start the Vite development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

## 📂 Project Structure

- `src/features/` - Groups logic by domain area (dashboard, employees, projects, tasks) rather than component type. Each feature houses its Redux slice and major UI components.
- `src/components/` - Houses reusable layout, navigation, and generic components.
- `src/app/store.js` - Configuration point for the Redux store.
- `src/theme.js` - Global Material UI context definitions.

## 🌟 Quality Standards Added
- **Validation**: Strict Form schema checks powered by Yup ensuring required fields and date logic (Start < End). Unique checks built-in on dispatch intercepts.
- **Persistence**: Data gracefully persists across browser reloads ensuring zero test data loss using the Web Storage API.
- **UI/UX**: Extensive use of Dialogs over separate routed pages for creations to ensure smooth user workflows.

## 📸 Overview
*(Attach screenshots or a GIF here in the final submission)*
