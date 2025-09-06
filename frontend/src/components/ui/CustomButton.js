import { jsx as _jsx } from "react/jsx-runtime";
import Button from '@mui/material/Button';
const CustomButton = ({ text, ...props }) => {
    return (_jsx(Button, { variant: "contained", fullWidth: true, disableElevation: true, ...props, children: text }));
};
export default CustomButton;
