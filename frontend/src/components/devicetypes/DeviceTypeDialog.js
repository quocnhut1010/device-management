import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Slide, Stack, CircularProgress, } from '@mui/material';
import { forwardRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
const Transition = forwardRef(function Transition(props, ref) {
    return _jsx(Slide, { direction: "up", ref: ref, ...props });
});
const DeviceTypeDialog = ({ open, onClose, onSubmit, initialData, isLoading = false, }) => {
    const { register, handleSubmit, reset, formState: { errors }, } = useForm({
        defaultValues: {
            typeName: '',
            description: '',
        },
    });
    useEffect(() => {
        if (open) {
            if (initialData) {
                reset({
                    typeName: initialData.typeName || '',
                    description: initialData.description || '',
                });
            }
            else {
                reset({
                    typeName: '',
                    description: '',
                });
            }
        }
    }, [open, initialData, reset]);
    const handleClose = () => {
        reset();
        onClose();
    };
    const onFormSubmit = (data) => {
        const payload = {
            ...data,
            id: initialData?.id, // Thêm id nếu đang cập nhật
        };
        onSubmit(payload);
    };
    return (_jsxs(Dialog, { open: open, onClose: handleClose, TransitionComponent: Transition, fullWidth: true, maxWidth: "sm", children: [_jsxs(DialogTitle, { children: [initialData ? 'Cập nhật' : 'Thêm', " lo\u1EA1i thi\u1EBFt b\u1ECB"] }), _jsx(DialogContent, { dividers: true, children: _jsxs("form", { onSubmit: handleSubmit(onFormSubmit), noValidate: true, children: [_jsxs(Stack, { spacing: 2, mt: 1, children: [_jsx(TextField, { label: "T\u00EAn lo\u1EA1i thi\u1EBFt b\u1ECB *", fullWidth: true, required: true, ...register('typeName', {
                                        required: 'Tên loại thiết bị không được để trống',
                                        maxLength: {
                                            value: 100,
                                            message: 'Không vượt quá 100 ký tự',
                                        },
                                    }), error: !!errors.typeName, helperText: errors.typeName?.message }), _jsx(TextField, { label: "M\u00F4 t\u1EA3", fullWidth: true, multiline: true, minRows: 2, ...register('description', {
                                        maxLength: {
                                            value: 255,
                                            message: 'Không vượt quá 255 ký tự',
                                        },
                                    }), error: !!errors.description, helperText: errors.description?.message })] }), _jsxs(DialogActions, { sx: { mt: 2 }, children: [_jsx(Button, { onClick: handleClose, disabled: isLoading, children: "Hu\u1EF7" }), _jsx(Button, { type: "submit", variant: "contained", disabled: isLoading, startIcon: isLoading ? _jsx(CircularProgress, { size: 20 }) : null, children: initialData ? 'Cập nhật' : 'Thêm' })] })] }) })] }));
};
export default DeviceTypeDialog;
