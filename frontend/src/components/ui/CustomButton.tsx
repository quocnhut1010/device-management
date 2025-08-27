import Button from '@mui/material/Button';
import type { ButtonProps } from '@mui/material/Button';

type Props = ButtonProps & {
  text: string;
};

const CustomButton = ({ text, ...props }: Props) => {
  return (
    <Button
      variant="contained"
      fullWidth
      disableElevation
      {...props}
    >
      {text}
    </Button>
  );
};

export default CustomButton;
