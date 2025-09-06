// src/hooks/useNotification.ts
import { useSnackbar } from 'notistack';
export const useNotification = () => {
    const { enqueueSnackbar } = useSnackbar();
    const notify = (message, variant = 'default') => {
        enqueueSnackbar(message, {
            variant,
            anchorOrigin: { vertical: 'top', horizontal: 'right' },
            autoHideDuration: 3000,
        });
    };
    return { notify };
};
