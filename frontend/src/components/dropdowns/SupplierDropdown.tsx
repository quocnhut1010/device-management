import { MenuItem, TextField } from '@mui/material';
import { useEffect, useState } from 'react';
import { getAllSuppliers, getActiveSuppliers } from '../../services/supplierService';
import { SupplierDto } from '../../types/SupplierDto';

interface Props {
  value: string;
  onChange: (value: string) => void;
  onlyActive?: boolean; // ✅ thêm prop
}

const SupplierDropdown = ({ value, onChange, onlyActive = false }: Props) => {
  const [suppliers, setSuppliers] = useState<SupplierDto[]>([]);

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        if (onlyActive) {
          const res = await getActiveSuppliers();
          setSuppliers(res.data);
        } else {
          const res = await getAllSuppliers();
          setSuppliers(res.data);
        }
      } catch (error) {
        console.error('Lỗi khi load suppliers:', error);
      }
    };
    fetchSuppliers();
  }, [onlyActive]);

  return (
    <TextField
      select
      fullWidth
      label="Nhà cung cấp"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {suppliers.map((sup) => (
        <MenuItem key={sup.id} value={sup.id}>
          {sup.supplierName}
        </MenuItem>
      ))}
    </TextField>
  );
};

export default SupplierDropdown;
