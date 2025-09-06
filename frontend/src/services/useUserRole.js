import { getUserFromToken, getUserRole } from './auth';
const useUserRole = () => {
    const user = getUserFromToken(); // đã bao gồm cả position
    const role = getUserRole();
    return { user, role };
};
export default useUserRole;
