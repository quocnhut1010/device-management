// src/services/userService.ts
import axios from './axios';

export const getAllUsers = async () => {
  const res = await axios.get('/api/users');
  return res.data;
};
