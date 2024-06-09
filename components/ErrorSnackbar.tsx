import React, { useEffect, useState } from 'react';
import { Snackbar, Alert } from '@mui/material';

export interface SnackbarError {
    message?: string;
    errorId?: string;
}

export const ErrorSnackbar: React.FC<SnackbarError> = ({ message, errorId }) => {
    const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);

    useEffect(() => {
        if (errorId && message) {
            setSnackbarOpen(true);
        }
    }, [errorId, message]);

    const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackbarOpen(false);
    };

    return (
        <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleClose}>
            <Alert onClose={handleClose} severity="error" sx={{ width: '100%' }}>
                {message}
            </Alert>
        </Snackbar>
    );
};
