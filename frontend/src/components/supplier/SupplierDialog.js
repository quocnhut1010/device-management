import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/components/supplier/SupplierDialog.tsx
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Slide, Stack, } from '@mui/material';
import { forwardRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
const Transition = forwardRef(function Transition(props, ref) {
    return _jsx(Slide, { direction: "up", ref: ref, ...props });
});
const SupplierDialog = ({ open, onClose, onSubmit, initialData }) => {
    const { register, handleSubmit, setValue, reset, formState: { errors }, } = useForm({
        defaultValues: {
            supplierName: '',
            contactPerson: '',
            email: '',
            phone: '',
        },
    });
    useEffect(() => {
        if (open) {
            if (initialData) {
                reset({
                    supplierName: initialData.supplierName || '',
                    contactPerson: initialData.contactPerson || '',
                    email: initialData.email || '',
                    phone: initialData.phone || '',
                });
            }
            else {
                reset({
                    supplierName: '',
                    contactPerson: '',
                    email: '',
                    phone: '',
                });
            }
        }
    }, [open, initialData, reset]);
    const onFormSubmit = (data) => {
        const payload = {
            ...data,
            id: initialData?.id, // nếu đang cập nhật
        };
        onSubmit(payload);
        handleClose();
    };
    const handleClose = () => {
        onClose();
        reset(); // clear form
    };
    return (_jsxs(Dialog, { open: open, TransitionComponent: Transition, onClose: handleClose, fullWidth: true, maxWidth: "sm", children: [_jsxs(DialogTitle, { children: [initialData ? 'Cập nhật' : 'Thêm', " nh\u00E0 cung c\u1EA5p"] }), _jsx(DialogContent, { dividers: true, children: _jsxs("form", { onSubmit: handleSubmit(onFormSubmit), noValidate: true, children: [_jsxs(Stack, { spacing: 2, mt: 1, children: [_jsx(TextField, { label: "T\u00EAn nh\u00E0 cung c\u1EA5p *", fullWidth: true, required: true, ...register('supplierName', {
                                        required: 'Tên nhà cung cấp không được để trống',
                                        maxLength: {
                                            value: 100,
                                            message: 'Tên không vượt quá 100 ký tự',
                                        },
                                    }), error: !!errors.supplierName, helperText: errors.supplierName?.message }), _jsx(TextField, { label: "Ng\u01B0\u1EDDi li\u00EAn h\u1EC7", fullWidth: true, ...register('contactPerson', {
                                        maxLength: {
                                            value: 100,
                                            message: 'Người liên hệ không vượt quá 100 ký tự',
                                        },
                                    }), error: !!errors.contactPerson, helperText: errors.contactPerson?.message }), _jsx(TextField, { label: "Email", fullWidth: true, ...register('email', {
                                        maxLength: {
                                            value: 100,
                                            message: 'Email không vượt quá 100 ký tự',
                                        },
                                        pattern: {
                                            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                            message: 'Email không hợp lệ',
                                        },
                                    }), error: !!errors.email, helperText: errors.email?.message }), _jsx(TextField, { label: "S\u1ED1 \u0111i\u1EC7n tho\u1EA1i", fullWidth: true, ...register('phone', {
                                        maxLength: {
                                            value: 20,
                                            message: 'Số điện thoại không vượt quá 20 ký tự',
                                        },
                                        pattern: {
                                            value: /^[0-9+\-()\s]*$/,
                                            message: 'Số điện thoại không hợp lệ',
                                        },
                                    }), error: !!errors.phone, helperText: errors.phone?.message })] }), _jsxs(DialogActions, { sx: { mt: 2 }, children: [_jsx(Button, { onClick: handleClose, children: "Hu\u1EF7" }), _jsx(Button, { type: "submit", variant: "contained", children: initialData ? 'Cập nhật' : 'Thêm' })] })] }) })] }));
};
export default SupplierDialog;
