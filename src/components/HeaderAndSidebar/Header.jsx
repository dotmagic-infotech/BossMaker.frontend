// React imports
import { useState } from "react";
import { useNavigate } from 'react-router-dom';

// MUI Imports
import { Typography, Avatar, Menu, MenuItem, Divider, ListItemIcon } from "@mui/material";
import PasswordOutlinedIcon from '@mui/icons-material/PasswordOutlined';
import { Logout } from "@mui/icons-material";

// Custom Context
import { useAuth } from "../../context/AuthContext";

// AppUtils
import { stringAvatar } from "../../utils/appUtils";

const Header = () => {

    // Hooks
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    // State
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <header
            style={{
                backgroundColor: 'transparent',
                display: 'flex',
                padding: "0px 10px 10px 10px",
                alignItems: 'center',
                justifyContent: 'space-between'
            }}
        >
            <div>
                <Typography sx={{ fontSize: '21px', fontWeight: 600 }}>
                    {user ? `Welcome ${user?.first_name}` : "Loading user..."}
                </Typography>
                <Typography>Here’s what’s happening with your store today.</Typography>
            </div>

            {/* Avatar with Menu */}
            <div
                style={{ cursor: 'pointer' }}
                onClick={handleClick}
                role="button"
                aria-label="Open profile menu"
            >
                <Avatar src={user?.profile_image} {...stringAvatar(`${user?.first_name} ${user?.last_name}`)} />
            </div>

            <Menu
                anchorEl={anchorEl}
                id="account-menu"
                open={open}
                onClose={handleClose}
                onClick={handleClose}
                slotProps={{
                    paper: {
                        elevation: 0,
                        sx: {
                            overflow: 'visible',
                            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                            mt: 1.5,
                            '& .MuiAvatar-root': {
                                width: 32,
                                height: 32,
                                ml: -0.5,
                                mr: 1,
                            },
                            '&::before': {
                                content: '""',
                                display: 'block',
                                position: 'absolute',
                                top: 0,
                                right: 14,
                                width: 10,
                                height: 10,
                                bgcolor: 'background.paper',
                                transform: 'translateY(-50%) rotate(45deg)',
                                zIndex: 0,
                            },
                        },
                    },
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
                <MenuItem onClick={() => navigate('/admin/profile')}>
                    <Avatar src={user?.profile_image} /> {user?.first_name} {user?.last_name}
                </MenuItem>
                <MenuItem onClick={() => navigate('/admin/change-password')}>
                    <ListItemIcon>
                        <PasswordOutlinedIcon fontSize="small" />
                    </ListItemIcon>
                    Change Password
                </MenuItem>
                <Divider />
                <MenuItem onClick={() => {
                    logout();
                    navigate("/admin/signin");
                }}>
                    <ListItemIcon>
                        <Logout fontSize="small" />
                    </ListItemIcon>
                    Logout
                </MenuItem>
            </Menu>
        </header>
    );
};

export default Header;
