import { jsx as _jsx } from "react/jsx-runtime";
// src/components/common/DataTable.tsx
import { DataGrid, } from '@mui/x-data-grid';
import { Paper } from '@mui/material';
const DataTable = ({ rows, columns, pageSize = 10, height = 500 }) => {
    return (_jsx(Paper, { elevation: 2, sx: { height, width: '100%' }, children: _jsx(DataGrid, { rows: rows, columns: columns, pageSizeOptions: [pageSize], initialState: { pagination: { paginationModel: { pageSize } } }, disableRowSelectionOnClick: true, getRowId: (row) => row.id }) }));
};
export default DataTable;
