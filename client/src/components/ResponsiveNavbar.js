import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  useTheme,
  useMediaQuery,
  Badge,
  Tooltip
} from '@mui/material';
import {
  AccountCircle,
  ExitToApp,
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Public as PublicIcon,
  VerifiedUser as VerifyIcon,
  AdminPanelSettings as AdminIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ResponsiveNavbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/catalog');
    handleClose();
    setMobileDrawerOpen(false);
  };

  const handleDrawerToggle = () => {
    setMobileDrawerOpen(!mobileDrawerOpen);
  };

  const isActivePath = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const navigationItems = [
    {
      label: 'Public Catalog',
      path: '/catalog',
      icon: <PublicIcon />,
      public: true,
    },
    {
      label: 'Verify Certificate',
      path: '/verify',
      icon: <VerifyIcon />,
      public: true,
    },
    ...(user ? [
      {
        label: 'Dashboard',
        path: '/dashboard',
        icon: <DashboardIcon />,
        badge: user.role === 'manufacturer' ? 'pending_count' : null,
      },
      ...(user.role === 'admin' ? [{
        label: 'Admin Panel',
        path: '/admin',
        icon: <AdminIcon />,
        badge: 'review_count',
      }] : []),
    ] : []),
  ];

  const userMenuItems = user ? [
    {
      label: `${user.first_name} ${user.last_name}`,
      subtitle: user.role,
      action: () => navigate('/profile'),
      icon: <PersonIcon />,
    },
    {
      label: 'Organization',
      action: () => navigate('/profile#organization'),
      icon: <BusinessIcon />,
      show: user.role === 'manufacturer',
    },
    { divider: true },
    {
      label: 'Logout',
      action: handleLogout,
      icon: <ExitToApp />,
    },
  ] : [];

  const MobileDrawer = () => (
    <Drawer
      anchor="left"
      open={mobileDrawerOpen}
      onClose={handleDrawerToggle}
      sx={{
        '& .MuiDrawer-paper': {
          width: 280,
          backgroundColor: theme.palette.background.paper,
        },
      }}
    >
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h6" color="primary" fontWeight="bold">
          OSI Platform
        </Typography>
        <IconButton onClick={handleDrawerToggle}>
          <CloseIcon />
        </IconButton>
      </Box>
      <Divider />
      
      <List>
        {navigationItems.map((item) => (
          <ListItem
            key={item.path}
            button
            onClick={() => {
              navigate(item.path);
              setMobileDrawerOpen(false);
            }}
            sx={{
              backgroundColor: isActivePath(item.path) ? theme.palette.primary.main + '10' : 'transparent',
              borderRight: isActivePath(item.path) ? `3px solid ${theme.palette.primary.main}` : 'none',
              '&:hover': {
                backgroundColor: theme.palette.primary.main + '08',
              },
            }}
          >
            <ListItemIcon sx={{ color: isActivePath(item.path) ? theme.palette.primary.main : 'inherit' }}>
              {item.badge ? (
                <Badge badgeContent={0} color="error">
                  {item.icon}
                </Badge>
              ) : (
                item.icon
              )}
            </ListItemIcon>
            <ListItemText 
              primary={item.label}
              sx={{ 
                color: isActivePath(item.path) ? theme.palette.primary.main : 'inherit',
                '& .MuiListItemText-primary': {
                  fontWeight: isActivePath(item.path) ? 600 : 400,
                },
              }}
            />
          </ListItem>
        ))}
      </List>

      {user && (
        <>
          <Divider sx={{ mt: 'auto' }} />
          <Box sx={{ p: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Signed in as
            </Typography>
            <Typography variant="body1" fontWeight="medium">
              {user.first_name} {user.last_name}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {user.role}
            </Typography>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<ExitToApp />}
              onClick={handleLogout}
              size="small"
            >
              Logout
            </Button>
          </Box>
        </>
      )}

      {!user && (
        <>
          <Divider sx={{ mt: 'auto' }} />
          <Box sx={{ p: 2, display: 'flex', gap: 1 }}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => {
                navigate('/login');
                setMobileDrawerOpen(false);
              }}
            >
              Login
            </Button>
            <Button
              fullWidth
              variant="contained"
              onClick={() => {
                navigate('/register');
                setMobileDrawerOpen(false);
              }}
            >
              Register
            </Button>
          </Box>
        </>
      )}
    </Drawer>
  );

  return (
    <>
      <AppBar position="static" elevation={0}>
        <Toolbar sx={{ px: { xs: 1, sm: 2, md: 3 } }}>
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}

          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              flexGrow: isMobile ? 1 : 0,
              fontWeight: 700,
              mr: 4,
            }}
          >
            <Link 
              to="/" 
              style={{ 
                color: 'inherit', 
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <VerifyIcon />
              OSI Platform
            </Link>
          </Typography>

          {!isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexGrow: 1 }}>
              {navigationItems.map((item) => (
                <Tooltip key={item.path} title={item.label}>
                  <Button
                    color="inherit"
                    component={Link}
                    to={item.path}
                    startIcon={item.badge ? (
                      <Badge badgeContent={0} color="error">
                        {item.icon}
                      </Badge>
                    ) : item.icon}
                    sx={{
                      borderRadius: 2,
                      px: 2,
                      py: 1,
                      backgroundColor: isActivePath(item.path) ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.08)',
                      },
                      fontWeight: isActivePath(item.path) ? 600 : 400,
                    }}
                  >
                    {item.label}
                  </Button>
                </Tooltip>
              ))}
            </Box>
          )}

          {!isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {user ? (
                <>
                  <Tooltip title="Account menu">
                    <IconButton
                      size="large"
                      aria-label="account of current user"
                      aria-controls="menu-appbar"
                      aria-haspopup="true"
                      onClick={handleMenu}
                      color="inherit"
                      sx={{
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        },
                      }}
                    >
                      <AccountCircle />
                    </IconButton>
                  </Tooltip>
                  <Menu
                    id="menu-appbar"
                    anchorEl={anchorEl}
                    anchorOrigin={{
                      vertical: 'bottom',
                      horizontal: 'right',
                    }}
                    keepMounted
                    transformOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
                    }}
                    open={Boolean(anchorEl)}
                    onClose={handleClose}
                    PaperProps={{
                      sx: {
                        mt: 1,
                        minWidth: 200,
                        borderRadius: 2,
                        boxShadow: theme.shadows[8],
                      },
                    }}
                  >
                    {userMenuItems.map((item, index) => {
                      if (item.divider) {
                        return <Divider key={index} />;
                      }
                      if (item.show === false) {
                        return null;
                      }
                      return (
                        <MenuItem
                          key={index}
                          onClick={() => {
                            item.action();
                            handleClose();
                          }}
                          sx={{
                            py: 1.5,
                            px: 2,
                            '&:hover': {
                              backgroundColor: theme.palette.primary.main + '08',
                            },
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                            {item.icon && (
                              <Box sx={{ mr: 2, color: 'text.secondary' }}>
                                {item.icon}
                              </Box>
                            )}
                            <Box>
                              <Typography variant="body2" fontWeight={item.subtitle ? 600 : 400}>
                                {item.label}
                              </Typography>
                              {item.subtitle && (
                                <Typography variant="caption" color="text.secondary">
                                  {item.subtitle}
                                </Typography>
                              )}
                            </Box>
                          </Box>
                        </MenuItem>
                      );
                    })}
                  </Menu>
                </>
              ) : (
                <>
                  <Button 
                    color="inherit" 
                    component={Link} 
                    to="/login"
                    sx={{ 
                      borderRadius: 2,
                      px: 3,
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.08)',
                      },
                    }}
                  >
                    Login
                  </Button>
                  <Button 
                    variant="contained"
                    component={Link} 
                    to="/register"
                    sx={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.15)',
                      color: 'white',
                      borderRadius: 2,
                      px: 3,
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.25)',
                      },
                    }}
                  >
                    Register
                  </Button>
                </>
              )}
            </Box>
          )}
        </Toolbar>
      </AppBar>
      
      {isMobile && <MobileDrawer />}
    </>
  );
};

export default ResponsiveNavbar;