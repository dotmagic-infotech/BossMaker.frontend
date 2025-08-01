// React Imports
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Mui Imports
import { TextField, Button, Typography, FormHelperText, FormControl, InputAdornment, IconButton, Grid, Box } from '@mui/material';

// Third-party Imports
import { Formik, Form } from 'formik';
import * as Yup from 'yup';

// Icons
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useApiRequest } from '../../components/UseApiRequest/useApiRequest';

// Custom Component
import { useToast } from '../../components/ToastProvider/ToastProvider';

const initialValues = {
    first_name: '',
    last_name: '',
    email: '',
    password: '',
};

const SignUp = () => {

    // Hooks
    const navigate = useNavigate();
    const apiRequest = useApiRequest();
    const { showToast } = useToast();

    // State
    const [showPassword, setShowPassword] = useState(false);

    const handleToggleVisibility = () => setShowPassword((prev) => !prev);

    const validationSchema = Yup.object({
        first_name: Yup.string().required("First Name required"),
        last_name: Yup.string().required("Last Name required"),
        email: Yup.string()
            .email('Invalid email format')
            .required('Email is required'),
        password: Yup.string()
            .required('Password is required')
            .min(8, 'Password must be at least 8 characters')
            .matches(/[A-Z]/, 'Must contain at least one uppercase letter')
            .matches(/[a-z]/, 'Must contain at least one lowercase letter')
            .matches(/[0-9]/, 'Must contain at least one number')
            .matches(/[@$!%*?&]/, 'Must contain at least one special character'),
    });

    const handleSubmit = async (values) => {
        const passdata = {
            first_name: values.first_name,
            last_name: values.last_name,
            email: values.email,
            password: values.password,
            user_type: 3,
        }

        const { data, status, error } = await apiRequest('/api/auth/register', 'POST', passdata);

        if (status) {
            showToast(data.message, "success");
            navigate("/admin/dashboard")
        } else {
            showToast(error, "error");
        }
    };

    return (
        <Grid container alignItems="center" justifyContent="center" height="100vh" bgcolor="rgb(255, 255, 255)">
            <Grid size={{ xs: 10, sm: 7, md: 5, lg: 4, xl: 3 }}>
                <div style={{
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                }}>
                    <img src='https://cdn.shopify.com/s/files/1/2212/5849/files/medal_1.png?v=1752596395' alt='bossmaker-logo' />
                    <Typography variant="h5" fontWeight={500} sx={{
                        fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
                        mb: 4, mt: 2,
                        textAlign: "center",
                        letterSpacing: "0.03333em"
                    }}>
                        Create Your Account
                    </Typography>
                    <Formik
                        initialValues={initialValues}
                        validationSchema={validationSchema}
                        onSubmit={handleSubmit}
                    >
                        {({ errors, handleChange, values }) => (
                            <Form style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "10px" }}>

                                <Box sx={{ display: "flex", gap: "10px", width: "100%" }}>
                                    <FormControl fullWidth error={Boolean(errors.first_name)}>
                                        <Typography sx={{ mx: 0.5, mb: 0.4 }}>First Name</Typography>
                                        <TextField
                                            id="first_name"
                                            type='text'
                                            placeholder="First Name"
                                            value={values.first_name}
                                            onChange={handleChange}
                                            error={errors.first_name}
                                        />
                                        {errors.first_name && (
                                            <FormHelperText sx={{ mt: 0.5, mx: 0 }}>{errors.first_name}</FormHelperText>
                                        )}
                                    </FormControl>
                                    <FormControl fullWidth error={Boolean(errors.last_name)}>
                                        <Typography sx={{ mx: 0.5, mb: 0.4 }}>Last Name</Typography>
                                        <TextField
                                            id="last_name"
                                            type='text'
                                            placeholder="Last Name"
                                            value={values.last_name}
                                            onChange={handleChange}
                                            error={errors.last_name}
                                        />
                                        {errors.last_name && (
                                            <FormHelperText sx={{ mt: 0.5, mx: 0 }}>{errors.last_name}</FormHelperText>
                                        )}
                                    </FormControl>
                                </Box>
                                {/* Email */}
                                <FormControl fullWidth error={Boolean(errors.email)}>
                                    <Typography sx={{ mx: 0.5, mb: 0.4 }}>Email Address</Typography>
                                    <TextField
                                        id="email"
                                        type='email'
                                        placeholder="Email"
                                        value={values.email}
                                        onChange={handleChange}
                                        error={errors.email}
                                    />
                                    {errors.email && (
                                        <FormHelperText sx={{ mt: 0.5, mx: 0 }}>{errors.email}</FormHelperText>
                                    )}
                                </FormControl>

                                {/* Password */}
                                <FormControl fullWidth error={Boolean(errors.password)}>
                                    <Typography sx={{ mx: 0.5, mb: 0.4 }}>Password</Typography>
                                    <TextField
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Password"
                                        value={values.password}
                                        onChange={handleChange}
                                        error={errors.password}
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
                                    {errors.password && (
                                        <FormHelperText sx={{ mt: 0.5, mx: 0 }}>{errors.password}</FormHelperText>
                                    )}
                                </FormControl>

                                <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2, backgroundColor: "black", borderRadius: "10px", padding: "10px 0px", fontWeight: "500", fontSize: "18px" }}>
                                    Next
                                </Button>
                                <Typography>
                                    Already have a BoosMaker Account? <span style={{ textDecoration: "underline", color: "#ff0101", cursor: "pointer" }} onClick={() => navigate("/admin/signin")}>Sign In</span>
                                </Typography>
                            </Form>
                        )}
                    </Formik>
                </div>
            </Grid>
        </Grid >
    );
};

export default SignUp;
