import { toast, ToastPosition, TypeOptions } from 'react-toastify';

export type AlertType = 'success' | 'error' | 'warning' | 'info' | 'loading';

export interface AlertOptions {
  position?: ToastPosition;
  autoClose?: number | false;
  hideProgressBar?: boolean;
  closeOnClick?: boolean;
  pauseOnHover?: boolean;
  draggable?: boolean;
  progress?: number | undefined;
  theme?: 'light' | 'dark' | 'colored';
}

const defaultOptions: AlertOptions = {
  position: 'top-right',
  autoClose: 5000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  theme: 'light',
};

const getToastType = (type: AlertType): TypeOptions => {
  switch (type) {
    case 'success':
      return 'success';
    case 'error':
      return 'error';
    case 'warning':
      return 'warning';
    case 'info':
      return 'info';
    case 'loading':
      return 'info';
    default:
      return 'default';
  }
};

export const showAlert = (
  type: AlertType,
  message: string,
  options: AlertOptions = {}
) => {
  const mergedOptions = { ...defaultOptions, ...options };
  
  return toast(message, {
    type: getToastType(type),
    position: mergedOptions.position,
    autoClose: type === 'loading' ? false : mergedOptions.autoClose,
    hideProgressBar: mergedOptions.hideProgressBar,
    closeOnClick: mergedOptions.closeOnClick,
    pauseOnHover: mergedOptions.pauseOnHover,
    draggable: mergedOptions.draggable,
    progress: mergedOptions.progress,
    theme: mergedOptions.theme,
  });
};

export const showSuccessAlert = (message: string, options?: AlertOptions) => {
  return showAlert('success', message, options);
};

export const showErrorAlert = (message: string, options?: AlertOptions) => {
  return showAlert('error', message, options);
};

export const showWarningAlert = (message: string, options?: AlertOptions) => {
  return showAlert('warning', message, options);
};

export const showInfoAlert = (message: string, options?: AlertOptions) => {
  return showAlert('info', message, options);
};

export const showLoadingAlert = (message: string, options?: AlertOptions) => {
  return showAlert('loading', message, { ...options, autoClose: false });
};

export const dismissAlert = (toastId?: string | number) => {
  if (toastId) {
    toast.dismiss(toastId);
  } else {
    toast.dismiss();
  }
};

export const updateAlert = (
  toastId: string | number,
  type: AlertType,
  message: string,
  options?: AlertOptions
) => {
  const mergedOptions = { ...defaultOptions, ...options };
  
  return toast.update(toastId, {
    render: message,
    type: getToastType(type),
    autoClose: type === 'loading' ? false : mergedOptions.autoClose,
    ...mergedOptions,
  });
};

// API response helper functions
export const handleApiSuccess = (message: string, data?: any) => {
  console.log('API Success:', data);
  return showSuccessAlert(message);
};

export const handleApiError = (error: any, customMessage?: string) => {
  console.error('API Error:', error);
  
  let message = customMessage || 'An error occurred';
  
  if (error?.response?.data?.message) {
    message = error.response.data.message;
  } else if (error?.message) {
    message = error.message;
  } else if (typeof error === 'string') {
    message = error;
  }
  
  return showErrorAlert(message);
};

export const handleApiWarning = (message: string, data?: any) => {
  console.warn('API Warning:', data);
  return showWarningAlert(message);
};

export const handleApiInfo = (message: string, data?: any) => {
  console.info('API Info:', data);
  return showInfoAlert(message);
};

export const showApiLoading = (message: string = 'Loading...') => {
  return showLoadingAlert(message);
};