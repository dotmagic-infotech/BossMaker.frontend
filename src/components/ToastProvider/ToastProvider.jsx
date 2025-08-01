// rEACT IMPORTS
import { createContext, useContext, useState } from 'react';

// Mui Imports
import { Snackbar, Alert } from '@mui/material';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
    const [toast, setToast] = useState({
        open: false,
        message: '',
        severity: 'success',
    });

    const showToast = (message, severity = 'success') => {
        setToast({ open: true, message, severity });
    };

    const handleClose = () => {
        setToast({ ...toast, open: false });
    };

    return (
        <ToastContext.Provider value={{ toast, showToast }}>
            {children}
            <Snackbar
                open={toast.open}
                autoHideDuration={3000}
                onClose={handleClose}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert onClose={handleClose} severity={toast.severity} variant="filled" sx={{ width: '100%' }}>
                    {toast.message}
                </Alert>
            </Snackbar>
        </ToastContext.Provider>
    );
};

export const useToast = () => useContext(ToastContext);
