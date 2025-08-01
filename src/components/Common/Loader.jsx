// React imports
import { Box, CircularProgress } from '@mui/material';

const Loader = () => {
    return (
        <Box
            sx={{
                minHeight: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                fontFamily: 'sans-serif',
                bgcolor: 'background.default',
                color: 'text.primary'
            }}
        >
            <CircularProgress size={50} thickness={1} color="inherit" />
        </Box>
    );
};

export default Loader;
