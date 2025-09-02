// src/components/common/UserAvatar.tsx
import {
  Avatar,
  Badge,
  styled,
  Box,
  IconButton,
  Tooltip,
} from '@mui/material';
import { ChangeEvent } from 'react';

// Helper lấy chữ cái đầu
const stringAvatar = (name: string) => {
  const initials = name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  return {
    children: initials,
  };
};

// Custom online badge
const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: '#44b700',
    color: '#44b700',
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    '&::after': {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      borderRadius: '50%',
      animation: 'ripple 1.2s infinite ease-in-out',
      border: '1px solid currentColor',
      content: '""',
    },
  },
  '@keyframes ripple': {
    '0%': {
      transform: 'scale(0.8)',
      opacity: 1,
    },
    '100%': {
      transform: 'scale(2.4)',
      opacity: 0,
    },
  },
}));

type Props = {
  name: string;
  imageUrl?: string;
  isOnline?: boolean;
  onClick?: () => void;
  editable?: boolean;
  onImageSelect?: (file: File) => void;
};

const UserAvatar = ({
  name,
  imageUrl,
  isOnline = true,
  onClick,
  editable = false,
  onImageSelect,
}: Props) => {
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImageSelect?.(e.target.files[0]);
    }
  };

  return (
    <Box sx={{ position: 'relative', display: 'inline-block' }}>
      <Tooltip title={editable ? 'Click để đổi ảnh' : ''}>
        <IconButton component="label" onClick={onClick} sx={{ p: 0 }}>
          <StyledBadge
            overlap="circular"
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            variant="dot"
            invisible={!isOnline}
          >
            <Avatar
              src={imageUrl}
              {...stringAvatar(name)}
              sx={{ width: 80, height: 80, fontSize: 28 }}
            />
          </StyledBadge>
          {editable && (
            <input
              hidden
              accept="image/*"
              type="file"
              onChange={handleImageChange}
            />
          )}
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export default UserAvatar;
