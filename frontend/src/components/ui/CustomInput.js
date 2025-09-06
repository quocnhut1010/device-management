import { jsx as _jsx } from "react/jsx-runtime";
import TextField from '@mui/material/TextField';
const CustomInput = (props) => {
    return (_jsx(TextField, { variant: "outlined", margin: "normal", fullWidth: true, ...props }));
};
export default CustomInput;
