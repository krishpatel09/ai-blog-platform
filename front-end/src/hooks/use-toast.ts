import toast from 'react-hot-toast';

export const useToast = () => {
    const showSuccess = (message: string) => {
        toast.success(message, {
            duration: 4000,
        });
    };

    const showError = (message: string) => {
        toast.error(message, {
            duration: 5000,
        });
    };

    const showLoading = (message: string) => {
        return toast.loading(message);
    };

    const showInfo = (message: string) => {
        toast(message, {
            duration: 4000,
            icon: 'ℹ️',
        });
    };

    const showWarning = (message: string) => {
        toast(message, {
            duration: 4000,
            icon: '⚠️',
            style: {
                border: '1px solid #f59e0b',
                background: '#fffbeb',
                color: '#92400e',
            },
        });
    };

    const dismiss = (toastId?: string) => {
        if (toastId) {
            toast.dismiss(toastId);
        } else {
            toast.dismiss();
        }
    };

    const updateToast = (toastId: string, message: string, type: 'success' | 'error' | 'loading' = 'success') => {
        if (type === 'success') {
            toast.success(message, { id: toastId });
        } else if (type === 'error') {
            toast.error(message, { id: toastId });
        } else {
            toast.loading(message, { id: toastId });
        }
    };

    return {
        showSuccess,
        showError,
        showLoading,
        showInfo,
        showWarning,
        dismiss,
        updateToast,
    };
};