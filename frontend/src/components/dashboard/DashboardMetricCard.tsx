import { Card, CardContent, Typography, Box } from '@mui/material';
import { ReactNode } from 'react';

interface Props {
  title: string;
  value: number | string;
  icon?: ReactNode;
  color?: string;
}

const DashboardMetricCard = ({ title, value, icon, color = '#6200ee' }: Props) => {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box display="flex" alignItems="center" gap={2}>
          {icon && <Box color={color} display="flex">{icon}</Box>}
          <Box flex={1}>
            <Typography variant="h4" fontWeight="bold" color={color}>
              {value}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {title}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default DashboardMetricCard;

