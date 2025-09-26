// src/components/dashboard/SummaryCard.tsx
import { Box, Paper, Typography, Avatar } from '@mui/material';
import type { ReactNode } from 'react';

interface SummaryCardProps {
  title: string;
  count: number;
  icon: ReactNode;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'info' | 'error';
  subtitle?: string; // Phần trăm hoặc thông tin bổ sung
}

const SummaryCard = ({ title, count, icon, color = 'primary', subtitle }: SummaryCardProps) => {
  return (
    <Paper
      elevation={3}
      sx={{
        p: 2,
        display: 'flex',
        alignItems: 'center',
        borderRadius: 3,
        backgroundColor: `${color}.lighter`,
        color: `${color}.darker`,
      }}
    >
      <Avatar
        sx={{
          bgcolor: `${color}.main`,
          color: 'white',
          width: 56,
          height: 56,
          mr: 2,
        }}
      >
        {icon}
      </Avatar>

      <Box>
        <Typography variant="h6" fontWeight={600}>
          {count.toLocaleString()}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
            {subtitle}
          </Typography>
        )}
      </Box>
    </Paper>
  );
};

export default SummaryCard;
