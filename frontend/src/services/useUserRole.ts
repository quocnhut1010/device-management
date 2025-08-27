import { getUserFromToken } from './auth';

export const useUserRole = () => {
  return getUserFromToken()?.role ?? 'User';
};
