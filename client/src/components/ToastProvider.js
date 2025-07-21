import React, { createContext, useContext, useState, useCallback } from 'react';
import { Snackbar, Alert, Slide } from '@mui/material';

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

function SlideTransition(props) {
  return <Slide {...props} direction="up" />;
}

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, severity = 'info', duration = 6000) => {
    const id = Date.now() + Math.random();
    const toast = {
      id,
      message,
      severity,
      duration,
      open: true,
    };

    setToasts(prev => [...prev, toast]);

    // Auto-hide after duration
    if (duration > 0) {
      setTimeout(() => {
        hideToast(id);
      }, duration);
    }

    return id;
  }, []);

  const hideToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const showSuccess = useCallback((message, duration) => {
    return showToast(message, 'success', duration);
  }, [showToast]);

  const showError = useCallback((message, duration) => {
    return showToast(message, 'error', duration);
  }, [showToast]);

  const showWarning = useCallback((message, duration) => {
    return showToast(message, 'warning', duration);
  }, [showToast]);

  const showInfo = useCallback((message, duration) => {
    return showToast(message, 'info', duration);
  }, [showToast]);

  const value = {
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    hideToast,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toasts.map((toast) => (
        <Snackbar
          key={toast.id}
          open={toast.open}
          autoHideDuration={toast.duration}
          onClose={() => hideToast(toast.id)}
          TransitionComponent={SlideTransition}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          sx={{ 
            '& .MuiSnackbar-root': {
              bottom: { xs: 90, sm: 24 }
            }
          }}
        >
          <Alert
            onClose={() => hideToast(toast.id)}
            severity={toast.severity}
            variant="filled"
            sx={{
              width: '100%',
              minWidth: 300,
              maxWidth: 500,
              boxShadow: 3,
            }}
          >
            {toast.message}
          </Alert>
        </Snackbar>
      ))}
    </ToastContext.Provider>
  );
};

export default ToastProvider;