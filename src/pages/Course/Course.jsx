// React Imports
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Mui Imports
import { DataGrid } from '@mui/x-data-grid';
import { Button, IconButton, Switch, Typography, Box, InputAdornment, TextField, Select, ListItemText, MenuItem } from '@mui/material';
import CreateOutlinedIcon from '@mui/icons-material/CreateOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import SearchIcon from '@mui/icons-material/Search';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';

// Third Party Imports
import { debounce } from 'lodash';

// Custom Component
import { useApiRequest } from '../../components/UseApiRequest/useApiRequest';
import { useToast } from '../../components/ToastProvider/ToastProvider';
import DeleteModal from '../../components/DeleteModal/DeleteModal';
import { hasPermission } from '../../utils/appUtils';
import { useAuth } from '../../context/AuthContext';

export default function Course() {
    // Hooks
    const { showToast } = useToast();
    const { user } = useAuth();
    const navigate = useNavigate();
    const apiRequest = useApiRequest();

    // State
    const [loading, setLoading] = useState(false);
    const [userId, setUserId] = useState(null);
    const [course, setCourse] = useState([]);
    const [pagination, setPagination] = useState({});
    const [courseName, setCourseName] = useState("")
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [page, setPage] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');

    const canEdit = hasPermission(user, "course", "edit");
    const isSuperAdmin = user?.user_type === 1;

    const fetchCourses = async () => {
        setLoading(true);
        try {
            const { data, status, error } = await apiRequest(`/api/course?limit=${15}&page=${page + 1}`, 'GET');
            if (status === 200) {
                setCourse(data.data);
                setPagination(data.pagination);
            } else {
                showToast(error, "error");
                setCourse([]);
            }
        } catch (error) {
            showToast("Failed to fetch users.", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCourses();
    }, [page]);

    const handleClose = () => {
        setDeleteModalOpen(false);
    };

    const handleDeleteCourse = (row) => {
        setCourseName(row.title || '');
        setUserId(row._id);
        setDeleteModalOpen(true)
    };

    const debouncedSearch = useMemo(() => debounce(async (value) => {
        setLoading(true);
        try {
            const { data, status, error } = await apiRequest(`/api/course?search=${value}`, 'GET');

            if (status === 200) {
                setCourse(data.data);
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

    // Change Status Handler
    const changeStatus = async (id, changeStatus) => {
        try {
            const { data, status, error } = await apiRequest(`/api/course/status`, 'PATCH', { id: id, status: changeStatus });
            if (status === 200) {
                showToast(data?.message, "success");
                fetchCourses();
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
            const { data, status, error } = await apiRequest(`/api/course/delete`, 'DELETE', { id: userId });
            if (status === 200) {
                showToast(data?.message, "success");
                fetchCourses();
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
        { field: 'title', headerName: 'TITLE', minWidth: 150, flex: 0.5, headerAlign: 'start', align: 'start' },
        {
            field: 'category', headerName: 'CATEGORY', flex: 0.5, headerAlign: 'start', align: 'start',
            valueGetter: (value, row) => `${row.category_id?.name || 'No Category'}`,
        },
        {
            field: 'Instructors', headerName: `${isSuperAdmin ? 'INSTRUCTORS' : 'PARTICIPANTS'}`, flex: 0.5, headerAlign: 'start', align: 'start',
            ...(user?.user_type === 1 ? { valueGetter: (value, row) => `${row.assigned_to?.first_name} ${row.assigned_to?.last_name}` } : {
                renderCell: (params) => {
                    const selectedRoles = params?.row?.participant_ids || [];

                    return (
                        <Box sx={{ height: "37px", width: "100%" }}>
                            <Select
                                multiple
                                displayEmpty
                                fullWidth
                                value={selectedRoles.map(p => p._id)}
                                sx={{ height: "100%" }}
                                renderValue={(selected) => (
                                    <span style={{ color: selected.length === 0 ? '#aaa' : 'inherit' }}>
                                        {selected.length === 0
                                            ? `No Participants`
                                            : `Selected Participants`}
                                    </span>
                                )}
                            >
                                {selectedRoles.map((person) => (
                                    <MenuItem key={person._id} value={person._id}>
                                        <ListItemText primary={`${person.first_name} ${person.last_name}`} />
                                    </MenuItem>
                                ))}
                            </Select>
                        </Box>
                    );
                }
            }),
        },
        {
            field: 'status', headerName: 'STATUS', minWidth: 150, headerAlign: 'start', align: 'start',
            renderCell: (params) => (
                <Box>
                    <Switch color="success" checked={params.row.status} disabled={!canEdit} onClick={() => changeStatus(params.row._id, !params.row.status)} />
                </Box>
            )
        },
        {
            field: 'Action', headerName: 'ACTIONS', minWidth: 150, flex: 0.5, headerAlign: 'center', align: 'center',
            renderCell: (params) => (
                <Box direction="row" spacing={1}>
                    <IconButton disabled={!canEdit} onClick={() => navigate(`/admin/course/edit-course/${params.row._id}`)}>
                        <CreateOutlinedIcon fontSize="medium" />
                    </IconButton>
                    <IconButton disabled={!canEdit} onClick={() => handleDeleteCourse(params.row)}>
                        <DeleteOutlineOutlinedIcon fontSize="medium" />
                    </IconButton>
                </Box>
            )
        },
    ];

    return (
        <Box style={{ padding: "1.25rem", height: "100%" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant='subtitle1' fontSize="1.5rem" fontWeight={500}>Course</Typography>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <TextField
                        size="small"
                        placeholder="Search course..."
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
                    {canEdit && (
                        <Button sx={{ bgcolor: "black", color: "white", fontWeight: '500' }} variant="outlined" startIcon={<AddOutlinedIcon />} onClick={() => navigate("/admin/course/add-course")}>
                            Add Course
                        </Button>
                    )}
                </div>
            </div>
            <Box sx={{ marginTop: "10px", height: "100%" }}>
                <DataGrid
                    className="custom-datagrid"
                    rows={loading ? [] : course}
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
                title={courseName}
                description={`This course will be deleted permanently.`}
                onClose={handleClose}
                onDelete={handleConfirmDelete}
            />
        </Box>
    );
}