// src/services/assignmentService.ts
import axios from './axios';

export const getAllAssignments = async () => {
  const res = await axios.get('/api/assignments');
  return res.data;
};
