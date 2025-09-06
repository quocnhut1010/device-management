import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
// src/components/department/DepartmentDialog.tsx
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Stack } from '@mui/material';
import { useEffect } from 'react';
import { createDepartment, updateDepartment } from '../../services/departmentService';
import { useNotification } from '../../hooks/useNotification';
import { useForm } from 'react-hook-form';
const DepartmentDialog = ({ open, onClose, refresh, selected }) => {
    const { notify } = useNotification();
    const { register, handleSubmit, setValue, reset, formState: { errors }, } = useForm({
        defaultValues: {
            departmentName: '',
            departmentCode: '',
            location: '',
        },
    });
    // Load dữ liệu khi sửa
    useEffect(() => {
        if (selected) {
            setValue('departmentName', selected.departmentName);
            setValue('departmentCode', selected.departmentCode || '');
            setValue('location', selected.location || '');
        }
        else {
            reset();
        }
    }, [selected, setValue, reset]);
    const onSubmit = async (data) => {
        try {
            if (selected) {
                await updateDepartment(selected.id, data);
                notify('Cập nhật phòng ban thành công', 'success');
            }
            else {
                await createDepartment(data);
                notify('Tạo mới phòng ban thành công', 'success');
            }
            refresh();
            handleClose();
        }
        catch (err) {
            console.error('Lỗi lưu phòng ban:', err);
            notify('Đã xảy ra lỗi khi lưu phòng ban', 'error');
        }
    };
    const handleClose = () => {
        onClose();
        reset(); // reset form khi đóng
    };
    return (_jsxs(Dialog, { open: open, onClose: handleClose, fullWidth: true, children: [_jsxs(DialogTitle, { children: [selected ? 'Cập nhật' : 'Thêm mới', " ph\u00F2ng ban"] }), _jsx(DialogContent, { children: _jsxs("form", { onSubmit: handleSubmit(onSubmit), noValidate: true, children: [_jsxs(Stack, { spacing: 2, mt: 1, children: [_jsx(TextField, { label: "T\u00EAn ph\u00F2ng ban *", fullWidth: true, ...register('departmentName', {
                                        required: 'Tên phòng ban không được để trống',
                                        maxLength: {
                                            value: 100,
                                            message: 'Tên phòng ban không vượt quá 100 ký tự',
                                        },
                                    }), error: !!errors.departmentName, helperText: errors.departmentName?.message }), _jsx(TextField, { label: "M\u00E3 ph\u00F2ng ban", fullWidth: true, ...register('departmentCode', {
                                        maxLength: {
                                            value: 50,
                                            message: 'Mã phòng ban không vượt quá 50 ký tự',
                                        },
                                    }), error: !!errors.departmentCode, helperText: errors.departmentCode?.message }), _jsx(TextField, { label: "V\u1ECB tr\u00ED", fullWidth: true, ...register('location', {
                                        maxLength: {
                                            value: 100,
                                            message: 'Vị trí không vượt quá 100 ký tự',
                                        },
                                    }), error: !!errors.location, helperText: errors.location?.message })] }), _jsxs(DialogActions, { sx: { mt: 2 }, children: [_jsx(Button, { onClick: handleClose, children: "H\u1EE7y" }), _jsx(Button, { type: "submit", variant: "contained", children: selected ? 'Cập nhật' : 'Thêm' })] })] }) })] }));
};
export default DepartmentDialog;
