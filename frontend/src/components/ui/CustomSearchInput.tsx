// src/components/ui/CustomSearchInput.tsx
import { TextField, InputAdornment } from '@mui/material';
import { Search } from '@mui/icons-material';

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const CustomSearchInput = ({ value, onChange, placeholder = 'Tìm kiếm...' }: Props) => {
  return (
    <TextField
      size="small"
      variant="outlined"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <Search />
          </InputAdornment>
        ),
      }}
    />
  );
};

export default CustomSearchInput;
