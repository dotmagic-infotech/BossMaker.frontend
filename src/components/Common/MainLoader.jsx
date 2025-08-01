// Mui Imports
import { Box, CircularProgress, Typography } from '@mui/material';

const MainLoader = () => {
    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                fontFamily: 'sans-serif',
                bgcolor: 'background.default',
                color: 'text.primary'
            }}
        >
            <Typography variant="h4" fontWeight={600} mb={3} color="inherit">
                Bossmaker
            </Typography>
            <CircularProgress size={50} thickness={1} color="inherit" />
        </Box>
    );
};

export default MainLoader;
