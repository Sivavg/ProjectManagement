import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Drawer, AppBar, Toolbar, List, Typography, Divider,
  IconButton, ListItem, ListItemButton, ListItemIcon, ListItemText, Avatar,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Work as WorkIcon,
  Task as TaskIcon,
} from '@mui/icons-material';

const drawerWidth = 240;

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
  { text: 'Employees', icon: <PeopleIcon />,    path: '/employees' },
  { text: 'Projects',  icon: <WorkIcon />,       path: '/projects' },
  { text: 'Tasks',     icon: <TaskIcon />,        path: '/tasks' },
];

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate  = useNavigate();
  const location  = useLocation();

  const currentPage = menuItems.find(item =>
    item.path === '/' ? location.pathname === '/' : location.pathname.startsWith(item.path)
  );

  const drawer = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Brand */}
      <Box sx={{ px: 2.5, py: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box sx={{
          width: 32, height: 32, borderRadius: 1,
          bgcolor: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '0.9rem' }}>P</Typography>
        </Box>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary' }}>
          ProManage
        </Typography>
      </Box>

      <Divider />

      {/* Nav Items */}
      <List sx={{ px: 1.5, pt: 1.5, flex: 1 }}>
        {menuItems.map((item) => {
          const isSelected = item.path === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(item.path);
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                selected={isSelected}
                onClick={() => { navigate(item.path); setMobileOpen(false); }}
                sx={{ borderRadius: 1.5, py: 1 }}
              >
                <ListItemIcon sx={{ minWidth: 36, color: isSelected ? 'primary.main' : 'text.secondary' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: isSelected ? 600 : 500 }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      {/* Footer */}
      <Divider />
      <Box sx={{ px: 2.5, py: 2 }}>
        <Typography variant="caption" color="text.secondary">© 2025 ProManage</Typography>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Top Bar */}
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          bgcolor: 'background.paper',
          color: 'text.primary',
        }}
      >
        <Toolbar sx={{ minHeight: '56px !important' }}>
          <IconButton edge="start" color="inherit" onClick={() => setMobileOpen(!mobileOpen)} sx={{ mr: 2, display: { sm: 'none' } }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="subtitle1" fontWeight={600}>
            {currentPage?.text || 'ProManage'}
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{ display: { xs: 'block', sm: 'none' }, '& .MuiDrawer-paper': { width: drawerWidth } }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{ display: { xs: 'none', sm: 'block' }, '& .MuiDrawer-paper': { width: drawerWidth } }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main */}
      <Box
        component="main"
        sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` }, mt: '56px' }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}
