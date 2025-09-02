// src/components/common/DataTable.tsx
import {
  DataGrid,
  GridColDef,
  GridRowsProp,
} from '@mui/x-data-grid';
import { Paper } from '@mui/material';

interface Props {
  rows: GridRowsProp;
  columns: GridColDef[];
  pageSize?: number;
  height?: number;
}

const DataTable = ({ rows, columns, pageSize = 10, height = 500 }: Props) => {
  return (
    <Paper elevation={2} sx={{ height, width: '100%' }}>
      <DataGrid
        rows={rows}
        columns={columns}
        pageSizeOptions={[pageSize]}
        initialState={{ pagination: { paginationModel: { pageSize } } }}
        disableRowSelectionOnClick
        getRowId={(row: any) => row.id}
      />
    </Paper>
  );
};

export default DataTable;
