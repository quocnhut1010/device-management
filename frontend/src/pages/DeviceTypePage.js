import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/pages/devicetypes/DeviceTypePage.tsx
import { Box, Button, Container, Typography, CircularProgress, } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useEffect, useState } from 'react';
import { getAllDeviceTypes, createDeviceType, updateDeviceType, deleteDeviceType, } from '../services/deviceTypeService';
import DeviceTypeDialog from '../components/devicetypes/DeviceTypeDialog';
import DeviceTypeTable from '../components/devicetypes/DeviceTypeTable';
import { toast } from 'react-toastify';
const DeviceTypePage = () => {
    const [deviceTypes, setDeviceTypes] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [selected, setSelected] = useState(null);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);
    const fetchDeviceTypes = async () => {
        setFetching(true);
        try {
            const res = await getAllDeviceTypes();
            setDeviceTypes(res.data);
        }
        catch (err) {
            toast.error('Không thể tải danh sách loại thiết bị!');
        }
        finally {
            setFetching(false);
        }
    };
    useEffect(() => {
        fetchDeviceTypes();
    }, []);
    const handleAdd = () => {
        setSelected(null);
        setOpenDialog(true);
    };
    const handleEdit = (data) => {
        setSelected(data);
        setOpenDialog(true);
    };
    const handleDelete = async (id) => {
        const confirm = window.confirm('Bạn có chắc muốn xoá loại thiết bị này?');
        if (!confirm)
            return;
        try {
            await deleteDeviceType(id);
            toast.success('Đã xoá loại thiết bị!');
            fetchDeviceTypes();
        }
        catch (err) {
            toast.error('❌ Xoá thất bại. Vui lòng thử lại!');
        }
    };
    const handleSubmit = async (data) => {
        try {
            setLoading(true);
            if (data.id) {
                // Đảm bảo data là DeviceTypeDto đầy đủ khi update
                const completeData = data;
                await updateDeviceType(completeData.id, completeData);
                toast.success('Cập nhật loại thiết bị thành công!');
            }
            else {
                // Đảm bảo data là DeviceTypeDto đầy đủ khi create
                const completeData = data;
                await createDeviceType(completeData);
                toast.success('Thêm loại thiết bị mới thành công!');
            }
            fetchDeviceTypes();
            setOpenDialog(false);
        }
        catch (err) {
            toast.error('Thao tác thất bại. Vui lòng kiểm tra lại!');
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsxs(Container, { sx: { mt: 4 }, children: [_jsxs(Box, { display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2, children: [_jsx(Typography, { variant: "h5", fontWeight: 600, children: "Qu\u1EA3n l\u00FD lo\u1EA1i thi\u1EBFt b\u1ECB" }), _jsx(Button, { variant: "contained", startIcon: _jsx(AddIcon, {}), onClick: handleAdd, children: "Th\u00EAm lo\u1EA1i thi\u1EBFt b\u1ECB" })] }), fetching ? (_jsx(Box, { display: "flex", justifyContent: "center", mt: 6, children: _jsx(CircularProgress, {}) })) : deviceTypes.length === 0 ? (_jsx(Typography, { color: "text.secondary", textAlign: "center", mt: 4, children: "Ch\u01B0a c\u00F3 lo\u1EA1i thi\u1EBFt b\u1ECB n\u00E0o \u0111\u01B0\u1EE3c th\u00EAm." })) : (_jsx(DeviceTypeTable, { data: deviceTypes, onEdit: handleEdit, onDelete: handleDelete })), _jsx(DeviceTypeDialog, { open: openDialog, onClose: () => setOpenDialog(false), onSubmit: handleSubmit, initialData: selected, isLoading: loading })] }));
};
export default DeviceTypePage;
