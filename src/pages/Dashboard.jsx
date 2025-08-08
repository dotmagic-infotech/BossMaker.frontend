// Mui Imports
import { Box, Card, Grid, Typography } from "@mui/material";

// Mui Icons

const Dashboard = () => {

    const counts = [
        { label: 'Courses', value: 10 },
        { label: 'Instructors', value: 10 },
        { label: 'Participants', value: 10 },
    ];

    return (
        <Box style={{ padding: "1.25rem" }} >
            <Grid container spacing={2}>
                {counts.map((stat, index) => (
                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
                        <Card
                            sx={{
                                bgcolor: "rgb(245, 245, 245)",
                                padding: "2rem",
                                borderRadius: "1rem",
                                boxShadow: "rgba(0, 0, 0, 0.35) 0rem 0.125rem 0.3125rem",
                                border: "0.0625rem solid rgb(170, 170, 170)",
                            }}
                        >
                            <Typography fontWeight={600} textAlign="center">{stat.label}</Typography>
                            <Typography fontWeight={600} textAlign="center">{stat.value}</Typography>
                        </Card>
                    </Grid>
                ))}
            </Grid>
            <h1>Welcome to Dashboard.</h1>
        </Box>
    );
};

export default Dashboard;
