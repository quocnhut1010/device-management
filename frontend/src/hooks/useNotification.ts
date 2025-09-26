import { useSnackbar, VariantType } from 'notistack';

const useNotification = () => {
  const { enqueueSnackbar } = useSnackbar();

  const notify = (message: string, variant: VariantType = 'default') => {
    enqueueSnackbar(message, { variant });
  };

  const showSuccess = (message: string) => notify(message, 'success');
  const showError = (message: string) => notify(message, 'error');
  const showWarning = (message: string) => notify(message, 'warning');

  return { notify, showSuccess, showError, showWarning };
};

export default useNotification;
