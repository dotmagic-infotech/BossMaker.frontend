// Mui Imports
import { Box, Typography } from "@mui/material";

const AccessDenied = () => {
  return (
    <Box style={{ padding: "1.25rem", height: "100%", gap: "0.5rem", display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column" }}>
      <Typography variant="h4">🚫 Access Denied</Typography>
      <Typography>You do not have permission to view this page.</Typography>
    </Box>
  );
};

export default AccessDenied;
