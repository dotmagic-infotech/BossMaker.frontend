// React Imports
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom';

// Mui Imports
import { TextField, Box, Avatar, Typography, FormControl, FormHelperText, Button, Divider, IconButton, InputAdornment, ListItem } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import Radio from '@mui/joy/Radio';

// Mui Icons
import { Visibility, VisibilityOff } from '@mui/icons-material';

// Formik + Yup
import { Formik, Form } from 'formik';
import * as Yup from 'yup';

// Third Party imports
import dayjs from 'dayjs';

// Custom Component
import Dropzone from '../../components/DropZone/Dropzone';
import { stringAvatar } from '../../utils/appUtils';
import { useToast } from '../../components/ToastProvider/ToastProvider';
import { useApiRequest } from '../../components/UseApiRequest/useApiRequest';
import { useAuth } from '../../context/AuthContext';

const initialValues = {
    first_name: '',
    last_name: '',
    email: '',
    mobile_no: '',
    dob: null,
    status: 'active',
    role: '',
    password: '',
};

function AddRoleUser() {

    // Hooks
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const apiRequest = useApiRequest();

    console.log("user::", user)

    // State
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState(initialValues);
    const [showPassword, setShowPassword] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);

    const handleToggleVisibility = () => setShowPassword((prev) => !prev);

    const fetchUser = async () => {
        try {
            const { data, status, error } = await apiRequest(`/api/user/${id}`, 'GET');
            if (status === 200) {
                const user = data.user;

                user.status = user.status === true ? "active" : "inactive";
                user.dob = user.dob ? dayjs(user.dob) : null;
                if (user.user_type === 1) {
                    user.role = 'Admin';
                } else if (user.user_type === 2) {
                    user.role = 'Member';
                } else if (user.user_type === 3) {
                    user.role = 'Participant';
                } else {
                    user.role = 'Unknown';
                }

                setFormData(user);
            } else {
                showToast(error, "error");
            }
        } catch (error) {
            showToast("Failed to fetch profile.", "error");
        }
    };

    useEffect(() => {
        if (id) {
            fetchUser();
        }
    }, [id]);

    const handleDrop = (acceptedFiles) => {
        const file = acceptedFiles[0];
        if (file) {
            file.preview = URL.createObjectURL(file);
            setSelectedFile(file);
        }
    };

    const validationSchema = Yup.object({
        first_name: Yup.string().required("First Name required"),
        last_name: Yup.string().required("Last Name required"),
        mobile_no: Yup.string().max(12).required("Mobile Number required"),
        email: Yup.string()
            .email('Invalid email format')
            .required('Email is required'),
        password: Yup.string()
            .required('Password is required')
            .min(6, 'Password must be at least 6 characters')
            .matches(/[A-Z]/, 'Must contain at least one uppercase letter')
            .matches(/[a-z]/, 'Must contain at least one lowercase letter')
            .matches(/[0-9]/, 'Must contain at least one number')
            .matches(/[@$!%*?&]/, 'Must contain at least one special character'),
    });

    const handleSubmit = async (values) => {

        const formData = new FormData();

        formData.append('first_name', values.first_name);
        formData.append('last_name', values.last_name);
        formData.append('status', values.status === 'active' ? true : false);
        formData.append('email', values.email);
        formData.append('mobile_no', values.mobile_no);
        formData.append('password', values.password);
        formData.append('user_type', user?.user_type === 1 ? 2 : 3);
        formData.append('dob', values.dob ? dayjs(values.dob).format('YYYY-MM-DD') : '');

        if (selectedFile instanceof File) {
            formData.append('profile_image', selectedFile);
        }

        setLoading(true);

        try {
            if (id) {
                const { data, status, error } = await apiRequest(`/api/user/update/${id}`, 'PUT', formData, true);
                if (status === 200) {
                    showToast(data.message, "success");
                    navigate("/admin/role-user");
                } else {
                    showToast(error, "error");
                }
            } else {
                const { data, status, error } = await apiRequest(`/api/user/create`, 'POST', formData, true);
                if (status === 200) {
                    showToast(data.message, "success");
                    navigate("/admin/role-user");
                } else {
                    showToast(error, "error");
                }
            }
        } catch (error) {
            showToast("Failed to update user.", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: "1.25rem", height: "100%", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant='subtitle1' fontSize="1.5rem" fontWeight={500}>Basic User Detail</Typography>
            </div>
            <Formik
                initialValues={formData}
                enableReinitialize
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
            >
                {({ errors, handleChange, values, setFieldValue, handleBlur, touched }) => (
                    <Form style={{ width: "100%", display: "flex", flexDirection: "column", gap: "10px" }}>
                        <div style={{ marginTop: "10px", display: "flex", alignItems: "center", gap: "1rem" }}>
                            <Avatar
                                src={selectedFile?.preview || values.profile_image}
                                {...stringAvatar(`${values.first_name} ${values.last_name}`)}
                                sx={{ width: 90, height: 90, fontSize: "3rem", bgcolor: "rgb(229, 229, 229)", color: "black", fontWeight: "500", borderRadius: "10px" }}
                            />
                            <div>
                                <Typography variant='h5' fontSize="19px">
                                    Profile picture
                                </Typography>
                                <Typography variant='caption' fontSize="0.75rem">
                                    Accepting file type .png .jpg .jpeg <br /> Max size 3MB
                                </Typography>
                            </div>
                            <Dropzone
                                onDrop={handleDrop}
                                name="Upload"
                                selectedFile={selectedFile}
                                multiple={false}
                                accept={{ 'image/*': [] }}
                            />
                        </div>

                        <Box sx={{ display: "flex", gap: "3rem", width: "100%" }}>
                            <FormControl fullWidth error={Boolean(errors.first_name)}>
                                <Typography sx={{ mx: 0.5, mb: 0.4 }} required>First Name</Typography>
                                <TextField
                                    id="first_name"
                                    type='text'
                                    placeholder="First Name"
                                    value={values.first_name}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={touched.first_name && Boolean(errors.first_name)}
                                    helperText={touched.first_name && errors.first_name}
                                />
                            </FormControl>
                            <FormControl fullWidth error={Boolean(errors.last_name)}>
                                <Typography sx={{ mx: 0.5, mb: 0.4 }}>Last Name</Typography>
                                <TextField
                                    id="last_name"
                                    type='text'
                                    placeholder="Last Name"
                                    value={values.last_name}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={touched.last_name && Boolean(errors.last_name)}
                                    helperText={touched.last_name && errors.last_name}
                                />
                            </FormControl>
                        </Box>
                        <Box sx={{ display: "flex", gap: "3rem", width: "100%" }}>
                            <FormControl fullWidth error={Boolean(errors.mobile_no)}>
                                <Typography sx={{ mx: 0.5, mb: 0.4 }}>Mobile Number</Typography>
                                <TextField
                                    id="mobile_no"
                                    type='number'
                                    maxRows={12}
                                    placeholder="Mobile Number"
                                    value={values.mobile_no}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={touched.mobile_no && Boolean(errors.mobile_no)}
                                    helperText={touched.mobile_no && errors.mobile_no}
                                />
                            </FormControl>
                            <FormControl fullWidth error={Boolean(errors.email)}>
                                <Typography sx={{ mx: 0.5, mb: 0.4 }}>Email Address</Typography>
                                <TextField
                                    id="email"
                                    type='text'
                                    placeholder="Email"
                                    value={values.email}
                                    onChange={(e) => {
                                        const lowercaseValue = e.target.value.toLowerCase();
                                        handleChange({
                                            target: {
                                                name: 'email',
                                                value: lowercaseValue,
                                            }
                                        });
                                    }}
                                    onBlur={handleBlur}
                                    error={touched.email && Boolean(errors.email)}
                                    helperText={touched.email && errors.email}
                                />
                            </FormControl>
                        </Box>
                        <Box sx={{ display: "flex", gap: "3rem", width: "100%" }}>
                            <FormControl fullWidth>
                                <Typography sx={{ mx: 0.5, mb: 0.4 }}>Status</Typography>
                                <ListItem sx={{ padding: "10px 0px", gap: "1rem" }}>
                                    <Radio checked={values.status === 'active'} onChange={handleChange} value="active" label="Active" name="status" size='md' />
                                    <Radio checked={values.status === 'inactive'} onChange={handleChange} value="inactive" label="Inactive" name="status" size='md' />
                                </ListItem>
                            </FormControl>
                        </Box>

                        <Divider sx={{ my: 2, borderColor: 'rgba(0, 0, 0, 0.12)' }} />
                        <Typography variant='subtitle1' fontSize="1.5rem" fontWeight={500}>Position Preference Detail</Typography>

                        <Box sx={{ display: "flex", gap: "3rem", width: "100%" }}>
                            <FormControl fullWidth error={Boolean(errors.dob)}>
                                <Typography sx={{ mx: 0.5, mb: 0.4 }}>Date of Birth</Typography>
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DatePicker
                                        id="dob"
                                        value={values.dob}
                                        onChange={(newValue) => setFieldValue('dob', newValue)}
                                    />
                                </LocalizationProvider>
                            </FormControl>
                            <FormControl fullWidth>
                                <Typography sx={{ mx: 0.5, mb: 0.4 }}>Role</Typography>
                                <TextField
                                    id="role"
                                    type='text'
                                    placeholder="Role"
                                    value={user?.user_type === 1 ? 'Member' : user?.user_type === 2 ? 'Participant' : ''}
                                    disabled
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={touched.role && Boolean(errors.role)}
                                    helperText={touched.role && errors.role}
                                />
                            </FormControl>
                        </Box>

                        <Divider sx={{ my: 2, borderColor: 'rgba(0, 0, 0, 0.12)' }} />
                        <Typography variant='subtitle1' fontSize="1.5rem" fontWeight={500}>Security Detail</Typography>

                        <Box sx={{ display: "flex", gap: "3rem", width: "100%" }}>
                            <FormControl fullWidth error={Boolean(errors.email)}>
                                <Typography sx={{ mx: 0.5, mb: 0.4 }}>Password</Typography>
                                <TextField
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Password"
                                    value={values.password}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={touched.password && Boolean(errors.password)}
                                    helperText={touched.password && errors.password}
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton onClick={handleToggleVisibility} edge="end">
                                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </FormControl>
                            <FormControl fullWidth>
                            </FormControl>
                        </Box>

                        {/* Save Cancel Button */}
                        <Box sx={{ display: "flex", justifyContent: "end", gap: "10px", width: "100%", mb: 5 }}>
                            <Button loading={loading} type="submit" variant="contained" color="primary" sx={{ backgroundColor: "black", width: "100px", borderRadius: "10px", padding: "10px", fontWeight: "500", fontSize: "18px" }}>
                                Save
                            </Button>
                            <Button variant="contained" color="" sx={{ backgroundColor: "white", width: "100px", borderRadius: "10px", padding: "10px", fontWeight: "500", fontSize: "18px" }}
                                onClick={() => navigate("/admin/role-user")}>
                                Cancel
                            </Button>
                        </Box>
                    </Form>
                )}
            </Formik>
        </div>
    )
}

export default AddRoleUser