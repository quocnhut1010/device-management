import axios from './axios';

export const getAdminStats = async () => {
  const res = await axios.get('/Dashboard/admin-stats');
  return res.data;
};

export const getAdminCharts = async () => {
  const res = await axios.get('/Dashboard/admin-charts');
  return res.data;
};

export const getAdminTables = async () => {
  const res = await axios.get('/Dashboard/admin-tables');
  return res.data;
};

export const getManagerStats = async (departmentId: string) => {
  const res = await axios.get(`/Dashboard/manager-stats?departmentId=${departmentId}`);
  return res.data;
};

export const getManagerCharts = async (departmentId: string) => {
  const res = await axios.get(`/Dashboard/manager-charts?departmentId=${departmentId}`);
  return res.data;
};

export const getTechnicianStats = async () => {
  const res = await axios.get('/Dashboard/technician-stats');
  return res.data;
};

export const getTechnicianCharts = async () => {
  const res = await axios.get('/Dashboard/technician-charts');
  return res.data;
};

export const getEmployeeStats = async () => {
  const res = await axios.get('/Dashboard/employee-stats');
  return res.data;
};

export const getEmployeeCharts = async () => {
  const res = await axios.get('/Dashboard/employee-charts');
  return res.data;
};

