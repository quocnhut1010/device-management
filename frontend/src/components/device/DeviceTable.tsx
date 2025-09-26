// src/components/device/DeviceTable.tsx
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import {
  Box,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  IconButton,
  Tooltip,
  Button,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RestoreIcon from '@mui/icons-material/SettingsBackupRestore';
import { useRef, useState } from 'react';
import { DeviceDto } from '../../types/device';
import { QRCodeCanvas } from 'qrcode.react';
import DownloadIcon from '@mui/icons-material/Download';
import DeviceDetailDialog from './DeviceDetailDialog';

const baseUrl = import.meta.env.VITE_API_BASE_URL || "";

interface Props {
  rows: DeviceDto[];
  isAdmin: boolean;
  isDeletedView: boolean;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onRestore: (id: string) => void;
  pagination: {
    page: number;
    pageSize: number;
    rowCount: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (pageSize: number) => void;
  };
}

const DeviceTable = ({
  rows,
  isAdmin,
  isDeletedView,
  onEdit,
  onDelete,
  onRestore,
  pagination,
}: Props) => {
  const [selectedDevice, setSelectedDevice] = useState<DeviceDto | null>(null);
  const qrRef = useRef<HTMLDivElement>(null);

  const handleInlineQRDownload = (device: DeviceDto) => {
    const canvas = document.createElement('canvas');
    const qr = document.createElement('div');

    document.body.appendChild(qr);

    const qrComponent = (
      <QRCodeCanvas
        value={JSON.stringify({
          id: device.id,
          deviceCode: device.deviceCode,
          deviceName: device.deviceName,
          barcode: device.barcode,
          status: device.status,
        })}
        size={256}
        level="H"
        includeMargin
      />
    );

    // Render tạm vào DOM để lấy canvas
    import('react-dom/client').then(({ createRoot }) => {
      const root = createRoot(qr);
      root.render(qrComponent);
      
      // Wait for render to complete
      setTimeout(() => {
        const canvas = qr.querySelector('canvas');
        if (!canvas) return;

        const url = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = url;
        link.download = `QR_${device.deviceCode}.png`;
        link.click();

        root.unmount();
        document.body.removeChild(qr);
      }, 100);
    });
  };



  const columns: GridColDef[] = [
    {
      field: 'deviceImageUrl',
      headerName: 'Ảnh',
      width: 120,
      renderCell: (params) =>
        params.value ? (
          <img
            src={`${baseUrl}${params.value}`}
            alt="device"
            style={{
              width: 80,
              height: 60,
              objectFit: 'contain',
              borderRadius: 4,
              border: '1px solid #eee',
              backgroundColor: '#fafafa',
            }}
          />
        ) : (
          <span style={{ color: '#aaa' }}>—</span>
        ),
    },
    {
  field: 'qr',
  headerName: 'QR Code',
  width: 80,
  renderCell: (params) =>
    params.row.barcode ? (
      <Tooltip title="Bấm để tải mã QR">
        <Box
          onClick={() => handleInlineQRDownload(params.row)}
          sx={{ cursor: 'pointer', display: 'inline-block', bgcolor: '#fff', p: 0.5, borderRadius: 1 }}
        >
          <QRCodeCanvas
            value={JSON.stringify({
              id: params.row.id,
              deviceCode: params.row.deviceCode,
              deviceName: params.row.deviceName,
              barcode: params.row.barcode,
              status: params.row.status,
            })}
            size={48}
            level="H"
            includeMargin={false}
          />
        </Box>
      </Tooltip>
    ) : (
      <span style={{ color: '#aaa' }}>—</span>
    ),
},

    { field: 'deviceName', headerName: 'Tên thiết bị', flex: 1.5 },
    { field: 'deviceCode', headerName: 'Mã thiết bị', flex: 1 },
    { field: 'supplierName', headerName: 'Nhà cung cấp', flex: 1 },
    { field: 'currentUserName', headerName: 'Người phụ trách', flex: 1 },
    {
      field: 'status',
      headerName: 'Trạng thái',
      flex: 1,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={params.value === 'Đang sử dụng' ? 'success' : 'default'}
          size="small"
        />
      ),
    },
    {
      field: 'actions',
      headerName: 'Thao tác',
      flex: 1,
      sortable: false,
      filterable: false,
      align: 'center',
      renderCell: (params) => {
        const id = params.row.id;
        return (
          <>
            {isAdmin && !isDeletedView && (
              <>
                <Tooltip title="Chỉnh sửa">
                  <IconButton onClick={() => onEdit(id)} color="primary">
                    <EditIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Xoá">
                  <IconButton onClick={() => onDelete(id)} color="error">
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </>
            )}
            {isAdmin && isDeletedView && (
              <Tooltip title="Khôi phục">
                <IconButton onClick={() => onRestore(id)} color="secondary">
                  <RestoreIcon />
                </IconButton>
              </Tooltip>
            )}
          </>
        );
      },
    },
  ];

  return (
    <>
      <Box sx={{ height: 520, width: '100%', bgcolor: 'background.paper', borderRadius: 2, boxShadow: 1 }}>
        <DataGrid
        
          rows={rows}
          columns={columns}
          getRowId={(row) => row.id}
          rowCount={pagination.rowCount}
          paginationModel={{
            page: pagination.page,
            pageSize: pagination.pageSize,
          }}
          onPaginationModelChange={(model) => {
            pagination.onPageChange(model.page);
            pagination.onPageSizeChange(model.pageSize);
          }}
          pageSizeOptions={[5, 10, 20]}
          paginationMode="server"
          disableRowSelectionOnClick
          onRowClick={(params, event) => {
          const isInActionsColumn = (event.target as HTMLElement).closest('[data-field="actions"]');
          if (!isInActionsColumn) {
            setSelectedDevice(params.row);
          }
          
        }}
          sx={{
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: '#f0f0f0',
              fontWeight: 'bold',
              position: 'sticky',
              top: 0,
              zIndex: 1,
            }, 
           // cursor: 'pointer',
          }}
          
        />
      </Box>

      <DeviceDetailDialog
        open={!!selectedDevice}
        device={selectedDevice}
        onClose={() => setSelectedDevice(null)}
      />
    </>
  );
};

export default DeviceTable;
