// React Imports
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Mui Imports
import { DataGrid } from '@mui/x-data-grid';
import { Button, IconButton, Switch, Typography, Box, InputAdornment, TextField } from '@mui/material';
import CreateOutlinedIcon from '@mui/icons-material/CreateOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import RemoveRedEyeOutlinedIcon from '@mui/icons-material/RemoveRedEyeOutlined';
import SearchIcon from '@mui/icons-material/Search';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';

// Custom Component
import { useToast } from '../../components/ToastProvider/ToastProvider';
import DeleteModal from '../../components/DeleteModal/DeleteModal';
import { useApiRequest } from '../../components/UseApiRequest/useApiRequest';

// Third Party Imports
import { debounce } from 'lodash';

export default function ParticipantsMangeAdmin() {

    // Hooks
    const { showToast } = useToast();
    const navigate = useNavigate();
    const apiRequest = useApiRequest();

    // State
    const [loading, setLoading] = useState(false);
    const [userId, setUserId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleUSerName, setRoleUSerName] = useState("")
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [userList, setUserList] = useState([]);
    const [pagination, setPagination] = useState({});
    const [page, setPage] = useState(0);

    const fetchParticipantUser = async () => {
        setLoading(true);
        try {
            const { data, status, error } = await apiRequest(`/api/user/getAllParticipant?limit=${15}&page=${page + 1}`, 'GET');
            if (status === 200) {
                setUserList(data.users);
                setPagination(data.pagination);
            } else {
                showToast(error, "error");
                setUserList([]);
            }
        } catch (error) {
            showToast("Failed to fetch users.", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchParticipantUser();
    }, [page]);

    const debouncedSearch = useMemo(() => debounce(async (value) => {
        setLoading(true);
        try {
            const { data, status, error } = await apiRequest(`/api/user/getAllParticipant?search=${value}`, 'GET');

            if (status === 200) {
                setUserList(data.users);
                setPagination(data.pagination);
            } else {
                showToast(error, "error");
            }
        } catch (err) {
            console.error('API Error:', err);
        } finally {
            setLoading(false);
        }
    }, 300), []);

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        debouncedSearch(value);
    };

    const handleClose = () => {
        setDeleteModalOpen(false);
        setUserId(null);
        setRoleUSerName("");
    };

    const handleDeleteRole = (row) => {
        setRoleUSerName(`${row.first_name || ''} ${row.last_name || ''}`);
        setUserId(row._id);
        setDeleteModalOpen(true);
    };

    // Change Status Handler
    const changeStatus = async (id, changeStatus) => {
        try {
            const { data, status, error } = await apiRequest(`/api/user/status`, 'PATCH', { id: id, status: changeStatus });
            if (status === 200) {
                showToast(data?.message, "success");
                fetchParticipantUser();
            } else {
                showToast(error, "error");
            }
        } catch (error) {
            showToast("Failed to change status.", "error");
        } finally {
            setLoading(false);
            handleClose();
        }
    };

    const handleConfirmDelete = async () => {
        setLoading(true);
        try {
            const { data, status, error } = await apiRequest(`/api/user/delete`, 'DELETE', { id: userId });
            if (status === 200) {
                showToast(data?.message, "success");
                fetchRoleUser();
            } else {
                showToast(error, "error");
            }
        } catch (error) {
            showToast("Failed to delete category.", "error");
        } finally {
            setLoading(false);
            handleClose();
        }
    };

    const columns = [
        {
            field: 'username', headerName: 'PARTICIPANTS NAME', minWidth: 150, flex: 0.5, headerAlign: 'start', align: 'start',
            valueGetter: (value, row) => `${row.first_name || ''} ${row.last_name || ''}`,
        },
        {
            field: 'instructor', headerName: 'INSTRUCTORS', minWidth: 150, flex: 0.5, headerAlign: 'start', align: 'start',
            valueGetter: (value, row) => `${row?.created_by?.first_name || ''} ${row?.created_by?.last_name || ''}`,
        },
        { field: 'email', headerName: 'EMAIL', minWidth: 150, flex: 0.5, headerAlign: 'start', align: 'start' },
        { field: 'mobile_no', headerName: 'MOBILE NUMBER', minWidth: 110, flex: 0.5, headerAlign: 'start', align: 'start' },
        {
            field: 'status', headerName: 'STATUS', minWidth: 150, headerAlign: 'start', align: 'start',
            renderCell: (params) => (
                <Box>
                    <Switch color="success" checked={params.row.status} onClick={() => changeStatus(params.row._id, !params.row.status)} />
                </Box>
            )
        },
        {
            field: 'Action', headerName: 'ACTIONS', minWidth: 150, flex: 0.5, headerAlign: 'center', align: 'center',
            renderCell: (params) => (
                <Box direction="row" spacing={1}>
                    <IconButton onClick={() => navigate(`/admin/participants/edit-participant/${params.row._id}`)}>
                        <CreateOutlinedIcon fontSize="medium" />
                    </IconButton>
                    <IconButton>
                        <RemoveRedEyeOutlinedIcon fontSize="medium" />
                    </IconButton>
                    <IconButton onClick={() => handleDeleteRole(params.row)}>
                        <DeleteOutlineOutlinedIcon fontSize="medium" />
                    </IconButton>
                </Box>
            )
        },
    ];

    return (
        <Box style={{ padding: "1.25rem", height: "100%" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant='subtitle1' fontSize="1.5rem" fontWeight={500}>Participants Management</Typography>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <TextField
                        size="small"
                        placeholder="Search participants..."
                        variant="outlined"
                        value={searchTerm}
                        onChange={handleSearchChange}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <SearchIcon />
                                </InputAdornment>
                            ),
                        }}
                    />
                    <Button sx={{ bgcolor: "black", color: "white", fontWeight: '500' }} variant="outlined" startIcon={<AddOutlinedIcon />} onClick={() => navigate("/admin/participants/add-participant")}>
                        Add Participants
                    </Button>
                </div>
            </div>
            <Box sx={{ marginTop: "10px", height: "100%" }}>
                <DataGrid
                    className="custom-datagrid"
                    rows={loading ? [] : userList}
                    columns={columns}
                    getRowId={(row) => row._id}
                    rowCount={pagination?.total_records}
                    paginationMode="server"
                    paginationModel={{
                        page: page,
                        pageSize: 15,
                    }}
                    onPaginationModelChange={(model) => {
                        setPage(model.page);
                    }}
                    loading={loading}
                    disableRowSelectionOnClick
                    disableColumnMenu
                    rowHeight={50}
                    slots={{
                        noRowsOverlay: () => (
                            <Box
                                sx={{
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: 1,
                                    p: 2,
                                }}
                            >
                                <Typography variant="body1" color="black">
                                    Oops, No data found!
                                </Typography>
                            </Box>
                        ),
                    }}
                    sx={{
                        height: "calc(100% - 5.3rem)",
                        borderRadius: "10px",
                        '& .MuiDataGrid-cell:focus': {
                            outline: 'none',
                        },
                        '& .MuiDataGrid-cell:focus-within': {
                            outline: 'none',
                        },
                        '& .MuiDataGrid-columnHeader': {
                            backgroundColor: "rgb(250, 250, 251)"
                        },
                    }}
                />
            </Box>

            {/* Delete Modal */}
            <DeleteModal
                open={deleteModalOpen}
                title={roleUSerName}
                description={`This user will be deleted permanently.`}
                onClose={handleClose}
                onDelete={handleConfirmDelete}
            />
        </Box>
    );
}
