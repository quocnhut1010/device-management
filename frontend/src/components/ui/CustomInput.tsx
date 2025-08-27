import TextField from '@mui/material/TextField';
import type { TextFieldProps } from '@mui/material/TextField';

type Props = TextFieldProps;

const CustomInput = (props: Props) => {
  return (
    <TextField
      variant="outlined"
      margin="normal"
      fullWidth
      {...props}
    />
  );
};

export default CustomInput;
