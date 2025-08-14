// React Imports
import { useEffect, useMemo, useState } from 'react';

// Mui Imports
import { DataGrid } from '@mui/x-data-grid';
import SearchIcon from '@mui/icons-material/Search';
import CreateOutlinedIcon from '@mui/icons-material/CreateOutlined';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import { Button, IconButton, Switch, Typography, Box, InputAdornment, TextField, Dialog, DialogTitle, DialogContent, FormControl, Select, MenuItem, FormHelperText, Divider } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

// Formik and Yup Imports
import { Formik, Form } from 'formik';
import * as Yup from 'yup';

// Custom Component
import { useToast } from '../../components/ToastProvider/ToastProvider';
import DeleteModal from '../../components/DeleteModal/DeleteModal';
import { useApiRequest } from '../../components/UseApiRequest/useApiRequest';
import { hasPermission } from "../../utils/appUtils";

// Third Party Imports
import debounce from 'lodash/debounce';
import { useAuth } from '../../context/AuthContext';
import { useCategory } from '../../context/CategoryContext';

// Utils
import { MenuProps } from '../../utils/appUtils';

const initialValues = {
    _id: "",
    name: "",
    id: "",
};

export default function Category() {

    // Hooks
    const { showToast } = useToast();
    const apiRequest = useApiRequest();
    const { user } = useAuth();
    const { instructors, refetchInstructors } = useCategory();

    // State
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [openCategory, setOpenCategory] = useState(false)
    const [formData, setFormData] = useState(initialValues);
    const [category, setCategory] = useState("")
    const [editCategoryId, setEditCategoryId] = useState(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [categoryList, setCategoryList] = useState([]);
    const [pagination, setPagination] = useState({});
    const [page, setPage] = useState(0);

    const canEdit = hasPermission(user, "category", "edit");

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const { data, status, error } = await apiRequest(`/api/categories?limit=${15}&page=${page + 1}`, 'GET');
            if (status === 200) {
                setCategoryList(data.data);
                setPagination(data.pagination);
            } else {
                setCategoryList([]);
                showToast(error, "error");
            }
        } catch (error) {
            showToast("Failed to fetch categories.", "error");
        } finally {
            setLoading(false);
        }
    };

    const findCategory = async (id) => {
        try {
            const { data, status, error } = await apiRequest(`/api/categories/findbyid/${id}`, 'GET');
            if (status === 200) {
                const category = data.data;
                category.id = category.assigned_to?._id;

                setFormData(category);
                setOpenCategory(true);
            } else {
                showToast(error, "error");
            }
        } catch (error) {
            showToast("Failed to get Category.", "error");
        } finally {
            setEditCategoryId(null);
        }
    };

    useEffect(() => {
        fetchCategories();
        refetchInstructors();
    }, [page]);

    useEffect(() => {
        if (formData?._id && user.user_type === 1) {
            findCategory();
        }
    }, []);

    const debouncedSearch = useMemo(() => debounce(async (value) => {
        setLoading(true);
        try {
            const { data, status, error } = await apiRequest(`/api/categories?search=${value}`, 'GET');

            if (status === 200) {
                setCategoryList(data.data);
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
        setOpenCategory(false);
        setDeleteModalOpen(false);
        setEditCategoryId(null);
        setCategory("");
        setFormData(initialValues);
    };

    const handleDeleteCategory = (row) => {
        setCategory(row.name);
        setEditCategoryId(row._id);
        setDeleteModalOpen(true)
    };

    const validationSchema = Yup.object({
        name: Yup.string().required("Category Name required"),
        id: Yup.string().when([], {
            is: () => user.user_type === 1,
            then: (schema) => schema.required("At least one user must be selected"),
            otherwise: (schema) => schema.notRequired(),
        }),
    });

    // Change Status Handler
    const changeStatus = async (id, changeStatus) => {
        try {
            const { data, status, error } = await apiRequest(`/api/categories/status`, 'PATCH', { id: id, status: changeStatus });
            if (status === 200) {
                showToast(data?.message, "success");
                fetchCategories();
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

    // Delete Confirmation Handler
    const handleConfirmDelete = async () => {
        setLoading(true);
        try {
            const { data, status, error } = await apiRequest(`/api/categories/delete`, 'DELETE', { id: editCategoryId });
            if (status === 200) {
                showToast(data?.message, "success");
                setDeleteModalOpen(false);
                fetchCategories();
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

    // Save or Update Category Handler
    const handleSubmit = async (values) => {
        setLoading(true);

        try {
            if (values?._id) {
                const payload = {
                    name: values.name,
                };

                if (user.user_type === 1) {
                    payload.id = values.id;
                }

                const { data, status, error } = await apiRequest(`/api/categories/update/${values?._id}`, 'PUT', payload);

                if (status === 200) {
                    showToast(data?.message, "success");
                    fetchCategories();
                    handleClose();
                } else {
                    showToast(error, "error");
                }
            } else {
                const passData = {
                    name: values.name,
                };

                if (user.user_type === 1) {
                    passData.id = values.id;
                }

                const { data, status, error } = await apiRequest('/api/categories/create', 'POST', passData);

                if (status === 200) {
                    showToast(data?.message, "success");
                    fetchCategories();
                    handleClose();
                } else {
                    showToast(error, "error");
                }
            }
        } catch (error) {
            showToast("Something went wrong.", "error");
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        { field: 'name', headerName: 'Category', flex: 0.5, headerAlign: 'start', align: 'start' },
        {
            field: 'users', headerName: 'USER NAME', minWidth: 150, flex: 0.5, headerAlign: 'start', align: 'start',
            valueGetter: (value, row) => `${row?.assigned_to?.first_name || ''} ${row?.assigned_to?.last_name || ''}`,
        },
        {
            field: 'status', headerName: 'CATEGORY STATUS', headerAlign: 'start', align: 'start', flex: 0.5,
            renderCell: (params) => (<Switch color="success" checked={params.row.status} disabled={!canEdit} onClick={() => changeStatus(params.row._id, !params.row.status)} />)
        },
        {
            field: 'Action', headerName: 'ACTIONS', flex: 0.5, headerAlign: 'center', align: 'center',
            renderCell: (params) => (
                <Box direction="row" spacing={1}>
                    <IconButton onClick={() => findCategory(params.row._id)} disabled={!canEdit}>
                        <CreateOutlinedIcon fontSize="medium" />
                    </IconButton>
                    <IconButton onClick={() => handleDeleteCategory(params.row)} disabled={!canEdit}>
                        <DeleteOutlineOutlinedIcon fontSize="medium" />
                    </IconButton>
                </Box>
            )
        },
    ];

    return (
        <Box style={{ padding: "1.25rem", height: "100%" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant='subtitle1' fontSize="1.5rem" fontWeight={500}>Category</Typography>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <TextField
                        size="small"
                        placeholder="Search category..."
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
                        <Button sx={{ bgcolor: "black", color: "white", fontWeight: '500' }} variant="outlined" startIcon={<AddOutlinedIcon />} onClick={() => setOpenCategory(true)}>
                            Add Categoty
                        </Button>
                    )}
                </div>
            </div>

            <Box sx={{ marginTop: "10px", height: "100%" }}>
                <DataGrid
                    className="custom-datagrid"
                    rows={loading ? [] : categoryList}
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

            <Dialog
                open={openCategory}
                onClose={handleClose}
                fullWidth
                sx={{ borderRadius: "12px" }}
            >
                <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    {formData?.id ? "Update" : "Add"} Category
                    <IconButton color='inherit' sx={{ border: "1px solid black" }} onClick={handleClose}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers>
                    <Formik
                        initialValues={formData}
                        enableReinitialize
                        validationSchema={validationSchema}
                        onSubmit={handleSubmit}
                    >
                        {({ errors, handleChange, values, handleBlur, touched }) => (
                            <Form style={{ width: "100%", display: "flex", flexDirection: "column", gap: "1rem" }}>
                                <FormControl fullWidth>
                                    <Typography sx={{ mx: 0.5, mb: 0.4 }}>Category Name</Typography>
                                    <TextField
                                        fullWidth
                                        autoFocus
                                        id="name"
                                        type='text'
                                        placeholder="Category Name"
                                        value={values.name}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        error={Boolean(touched.name && errors.name)}
                                        helperText={touched.name && errors.name ? errors.name : ''}
                                    />
                                </FormControl>
                                {user.user_type === 1 && (
                                    <FormControl fullWidth>
                                        <Typography sx={{ mx: 0.5, mb: 0.4 }}>Select User</Typography>
                                        <Select
                                            displayEmpty
                                            id="id"
                                            name="id"
                                            MenuProps={MenuProps}
                                            value={values.id || ""}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            error={Boolean(touched.id && errors.id)}
                                            helperText={touched.id && errors.id ? errors.id : ''}
                                            renderValue={(selected) => {
                                                if (!selected) return <span style={{ color: '#aaa' }}>Select User</span>;
                                                const person = instructors.find((n) => n._id === selected);
                                                return person ? `${person.first_name} ${person.last_name}` : '';
                                            }}
                                        >
                                            <MenuItem value="" disabled>Select User</MenuItem>
                                            {instructors.map((person) => (
                                                <MenuItem key={person._id} value={person._id}>
                                                    {person.first_name} {person.last_name}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                        {touched.id && Boolean(errors.id) && (
                                            <FormHelperText error>{errors.id}</FormHelperText>
                                        )}
                                    </FormControl>
                                )}
                                <Divider sx={{ margin: "0px -24px" }} />
                                <Box sx={{ display: "flex", justifyContent: "end", gap: "10px", width: "100%" }}>
                                    <Button type='submit' variant="contained" color="primary" loading={loading} sx={{ backgroundColor: "black", width: "100px", borderRadius: "10px", padding: "10px", fontWeight: "500", fontSize: "18px" }}>
                                        {values?._id ? "Update" : "Save"}
                                    </Button>
                                    <Button variant="contained" color="" sx={{ backgroundColor: "white", width: "100px", borderRadius: "10px", padding: "10px", fontWeight: "500", fontSize: "18px" }}
                                        onClick={() => handleClose()}>
                                        Cancel
                                    </Button>
                                </Box>
                            </Form>
                        )}
                    </Formik>
                </DialogContent>
            </Dialog>

            {/* Delete Modal */}
            <DeleteModal
                open={deleteModalOpen}
                title={category}
                description={`This category will be deleted permanently.`}
                onClose={handleClose}
                onDelete={handleConfirmDelete}
            />
        </Box>
    );
}
