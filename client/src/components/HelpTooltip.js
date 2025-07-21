import React from 'react';
import {
  Tooltip,
  IconButton,
  Typography,
  Box,
  Zoom,
  useTheme
} from '@mui/material';
import {
  HelpOutline as HelpIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  CheckCircle as SuccessIcon
} from '@mui/icons-material';

const HelpTooltip = ({
  title,
  description,
  type = 'info', // 'info', 'help', 'warning', 'success'
  placement = 'top',
  size = 'small',
  children,
  arrow = true,
  maxWidth = 300,
  interactive = false,
}) => {
  const theme = useTheme();

  const getIcon = () => {
    switch (type) {
      case 'help':
        return <HelpIcon fontSize={size} />;
      case 'warning':
        return <WarningIcon fontSize={size} />;
      case 'success':
        return <SuccessIcon fontSize={size} />;
      default:
        return <InfoIcon fontSize={size} />;
    }
  };

  const getColor = () => {
    switch (type) {
      case 'warning':
        return theme.palette.warning.main;
      case 'success':
        return theme.palette.success.main;
      case 'help':
        return theme.palette.primary.main;
      default:
        return theme.palette.info.main;
    }
  };

  const tooltipContent = (
    <Box sx={{ maxWidth }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: description ? 0.5 : 0 }}>
        {title}
      </Typography>
      {description && (
        <Typography variant="body2" sx={{ opacity: 0.9 }}>
          {description}
        </Typography>
      )}
    </Box>
  );

  const triggerElement = children || (
    <IconButton
      size={size}
      sx={{
        color: getColor(),
        opacity: 0.7,
        '&:hover': {
          opacity: 1,
          backgroundColor: `${getColor()}10`,
        },
      }}
    >
      {getIcon()}
    </IconButton>
  );

  return (
    <Tooltip
      title={tooltipContent}
      placement={placement}
      arrow={arrow}
      TransitionComponent={Zoom}
      interactive={interactive}
      componentsProps={{
        tooltip: {
          sx: {
            backgroundColor: theme.palette.grey[800],
            color: theme.palette.common.white,
            fontSize: theme.typography.body2.fontSize,
            borderRadius: 2,
            boxShadow: theme.shadows[8],
            '& .MuiTooltip-arrow': {
              color: theme.palette.grey[800],
            },
          },
        },
      }}
    >
      {triggerElement}
    </Tooltip>
  );
};

// Specialized tooltip components
export const FieldHelpTooltip = ({ title, description, ...props }) => (
  <HelpTooltip
    title={title}
    description={description}
    type="help"
    size="small"
    placement="right"
    {...props}
  />
);

export const InfoTooltip = ({ title, description, ...props }) => (
  <HelpTooltip
    title={title}
    description={description}
    type="info"
    {...props}
  />
);

export const WarningTooltip = ({ title, description, ...props }) => (
  <HelpTooltip
    title={title}
    description={description}
    type="warning"
    {...props}
  />
);

export const SuccessTooltip = ({ title, description, ...props }) => (
  <HelpTooltip
    title={title}
    description={description}
    type="success"
    {...props}
  />
);

// Status indicator with tooltip
export const StatusIndicator = ({ 
  status, 
  title, 
  description, 
  size = 'small' 
}) => {
  const getStatusProps = () => {
    switch (status) {
      case 'success':
      case 'approved':
      case 'active':
        return { type: 'success', color: 'success.main' };
      case 'warning':
      case 'pending':
      case 'under_review':
        return { type: 'warning', color: 'warning.main' };
      case 'error':
      case 'rejected':
      case 'expired':
        return { type: 'warning', color: 'error.main' };
      default:
        return { type: 'info', color: 'info.main' };
    }
  };

  const statusProps = getStatusProps();

  return (
    <HelpTooltip
      title={title}
      description={description}
      type={statusProps.type}
      size={size}
    >
      <Box
        sx={{
          width: size === 'small' ? 8 : 12,
          height: size === 'small' ? 8 : 12,
          borderRadius: '50%',
          backgroundColor: statusProps.color,
          cursor: 'help',
        }}
      />
    </HelpTooltip>
  );
};

export default HelpTooltip;