import React from 'react';
import { 
  Box, 
  CircularProgress, 
  Typography, 
  Skeleton,
  Card,
  CardContent,
  Grid,
  useTheme
} from '@mui/material';

const LoadingSpinner = ({ 
  message = 'Loading...', 
  size = 40,
  fullScreen = false,
  variant = 'spinner' // 'spinner', 'skeleton', 'card-skeleton'
}) => {
  const theme = useTheme();

  if (variant === 'skeleton') {
    return (
      <Box sx={{ width: '100%' }}>
        <Skeleton variant="text" width="60%" height={40} sx={{ mb: 2 }} />
        <Skeleton variant="text" width="40%" height={24} sx={{ mb: 3 }} />
        <Skeleton variant="rectangular" width="100%" height={200} sx={{ borderRadius: 2 }} />
      </Box>
    );
  }

  if (variant === 'card-skeleton') {
    return (
      <Grid container spacing={3}>
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <Grid item xs={12} sm={6} md={4} key={item}>
            <Card>
              <CardContent>
                <Skeleton variant="text" width="80%" height={32} sx={{ mb: 1 }} />
                <Skeleton variant="text" width="60%" height={24} sx={{ mb: 2 }} />
                <Skeleton variant="rectangular" width="100%" height={120} sx={{ borderRadius: 1, mb: 2 }} />
                <Skeleton variant="text" width="40%" height={20} />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  }

  const containerProps = fullScreen ? {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    zIndex: theme.zIndex.modal,
    backdropFilter: 'blur(2px)',
  } : {
    minHeight: '200px',
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      gap={2}
      sx={containerProps}
    >
      <CircularProgress 
        size={size} 
        thickness={4}
        sx={{
          color: theme.palette.primary.main,
          '& .MuiCircularProgress-circle': {
            strokeLinecap: 'round',
          },
        }}
      />
      <Typography 
        variant="body2" 
        color="text.secondary"
        sx={{ 
          fontWeight: 500,
          textAlign: 'center',
          maxWidth: 300,
        }}
      >
        {message}
      </Typography>
    </Box>
  );
};

// Skeleton components for specific use cases
export const TableSkeleton = ({ rows = 5, columns = 4 }) => (
  <Box>
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <Box key={rowIndex} sx={{ display: 'flex', gap: 2, mb: 2 }}>
        {Array.from({ length: columns }).map((_, colIndex) => (
          <Skeleton 
            key={colIndex} 
            variant="text" 
            width={`${100 / columns}%`} 
            height={40} 
          />
        ))}
      </Box>
    ))}
  </Box>
);

export const ProductCardSkeleton = () => (
  <Card>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Skeleton variant="circular" width={24} height={24} sx={{ mr: 1 }} />
        <Skeleton variant="text" width={120} height={24} />
      </Box>
      <Skeleton variant="text" width="90%" height={32} sx={{ mb: 1 }} />
      <Skeleton variant="text" width="70%" height={24} sx={{ mb: 2 }} />
      <Skeleton variant="text" width="60%" height={20} sx={{ mb: 1 }} />
      <Skeleton variant="text" width="50%" height={20} sx={{ mb: 2 }} />
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Skeleton variant="text" width="40%" height={16} />
        <Skeleton variant="text" width="40%" height={16} />
      </Box>
    </CardContent>
  </Card>
);

export default LoadingSpinner;