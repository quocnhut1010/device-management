// src/hooks/useNotification.ts
import { useSnackbar, type VariantType } from 'notistack';

export const useNotification = () => {
  const { enqueueSnackbar } = useSnackbar();

  const notify = (message: string, variant: VariantType = 'default') => {
    enqueueSnackbar(message, {
      variant,
      anchorOrigin: { vertical: 'top', horizontal: 'right' },
      autoHideDuration: 3000,
    });
  };

  return { notify };
};
