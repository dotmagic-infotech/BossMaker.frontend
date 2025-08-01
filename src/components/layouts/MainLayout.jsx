import { Outlet } from "react-router-dom";

// Mui Imports
import Card from "@mui/material/Card";

// Custom Component
import Header from "../HeaderAndSidebar/Header";
import Sidebar from "../HeaderAndSidebar/Sidebar";

const MainLayout = () => {
    return (
        <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', backgroundColor: "rgb(229, 229, 229)" }}>
            <Sidebar />

            <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', padding: "10px" }}>
                <Header />
                <Card sx={{ flexGrow: 1, borderRadius: '1.25rem', height: '100%', boxShadow: 'rgba(0, 0, 0, 0.25) 0px 0.125rem 0.25rem 0.0625rem' }}>
                    <Outlet />
                </Card>
            </div>
        </div>
    );
};

export default MainLayout;
