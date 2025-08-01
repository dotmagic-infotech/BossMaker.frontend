// React Imports
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

// Mui Imports
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Box, Typography, Switch, Button, CircularProgress } from '@mui/material';

// Custom Components
import { useToast } from "../../components/ToastProvider/ToastProvider";
import { useApiRequest } from "../../components/UseApiRequest/useApiRequest";

export default function Permission() {

    // Hooks
    const navigate = useNavigate();
    const { id } = useParams();
    const { showToast } = useToast();
    const apiRequest = useApiRequest();

    // State
    const [loading, setLoading] = useState(false);
    const [permissions, setPermissions] = useState({});

    const fetchUser = async () => {
        setLoading(true);
        try {
            const { data, status, error } = await apiRequest(`/api/user/permissions/${id}`, 'GET');
            if (status === 200) {
                setPermissions(data.permission);
            } else {
                showToast(error, "error");
            }
        } catch (error) {
            showToast("Failed to fetch profile.", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) {
            fetchUser();
        }
    }, [id]);

    const handleToggle = (module, permId) => {
        setPermissions(prev => ({
            ...prev,
            [module]: prev[module].map(p =>
                p._id === permId ? { ...p, is_access: !p.is_access } : p
            )
        }));
    };

    const handleSave = async () => {
        setLoading(true);

        try {
            const payload = {
                id: id,
                permissions: []
            };

            Object.values(permissions).forEach(modulePerms => {
                modulePerms.forEach(p => {
                    payload.permissions.push({
                        id: p._id,
                        is_access: p.is_access
                    });
                });
            });

            const { data, status, error } = await apiRequest(`/api/user/update-permissions`, 'PUT', payload);

            if (status === 200) {
                showToast(data.message, "success");
                navigate("/admin/role-user");
            } else {
                showToast(error || "Something went wrong", "error");
            }
        } catch (err) {
            showToast("Unexpected error occurred", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box style={{ padding: "1.25rem", height: "100%" }}>
            <Typography variant='subtitle1' fontSize="1.5rem" fontWeight={500}>
                Edit User Permissions
            </Typography>

            <TableContainer component={Paper} sx={{ marginTop: "1rem", maxHeight: "calc(100vh - 200px)" }}>
                <Table sx={{ minWidth: 700 }}>
                    <TableHead sx={{ backgroundColor: 'black' }}>
                        <TableRow>
                            <TableCell><Typography color='white'>Module</Typography></TableCell>
                            <TableCell align="start"><Typography color='white'>View</Typography></TableCell>
                            <TableCell align="start"><Typography color='white'>Edit</Typography></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={3} align="center">
                                    <CircularProgress size={50} variant="indeterminate" color='inherit' />
                                </TableCell>
                            </TableRow>
                        ) : (
                            Object.entries(permissions).map(([moduleName, perms]) => {
                                const view = perms.find(p => p.action === 'view');
                                const edit = perms.find(p => p.action === 'edit');

                                return (
                                    <TableRow key={moduleName}>
                                        <TableCell>
                                            <Typography variant='h6'>{moduleName}</Typography>
                                        </TableCell>

                                        <TableCell align="start" sx={{ padding: "16px 0px" }}>
                                            {view ? (
                                                <Switch
                                                    color="success"
                                                    checked={view.is_access}
                                                    onChange={() => handleToggle(moduleName, view._id)}
                                                />
                                            ) : <Typography color='black'>No View</Typography>}
                                        </TableCell>

                                        <TableCell align="start" sx={{ padding: "16px 0px" }}>
                                            {edit ? (
                                                <Switch
                                                    color="success"
                                                    checked={edit.is_access}
                                                    onChange={() => handleToggle(moduleName, edit._id)}
                                                />
                                            ) : <Typography color='black'>No Edit</Typography>}
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Box sx={{ display: "flex", justifyContent: "end", gap: "10px", width: "100%", mt: 2 }}>
                <Button loading={loading} type="submit" variant="contained" color="primary" sx={{ backgroundColor: "black", width: "100px", borderRadius: "10px", padding: "10px", fontWeight: "500", fontSize: "18px" }} onClick={handleSave}>
                    Save
                </Button>
                <Button variant="contained" color="" sx={{ backgroundColor: "white", width: "100px", borderRadius: "10px", padding: "10px", fontWeight: "500", fontSize: "18px" }}
                    onClick={() => navigate("/admin/role-user")}>
                    Cancel
                </Button>
            </Box>
        </Box>
    );
}
