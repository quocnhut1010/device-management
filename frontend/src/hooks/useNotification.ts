import { useSnackbar, VariantType } from 'notistack';

const useNotification = () => {
  const { enqueueSnackbar } = useSnackbar();

  const notify = (message: string, variant: VariantType = 'default') => {
    enqueueSnackbar(message, { variant });
  };

  const showSuccess = (message: string) => notify(message, 'success');
  const showError = (message: string) => notify(message, 'error');
  const showWarning = (message: string) => notify(message, 'warning');
  
  // Add showNotification for compatibility
  const showNotification = (message: string, variant: VariantType = 'default') => {
    notify(message, variant);
  };

  return { notify, showSuccess, showError, showWarning, showNotification };
};

export default useNotification;
export { useNotification };
