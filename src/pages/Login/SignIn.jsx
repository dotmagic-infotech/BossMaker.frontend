// React Imports
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Mui Imports
import { TextField, Button, Typography, FormHelperText, FormControl, InputAdornment, IconButton, Grid, Checkbox } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

// Third-party Imports
import { Formik, Form } from 'formik';
import * as Yup from 'yup';

// Custom Component
import { useApiRequest } from '../../components/UseApiRequest/useApiRequest';
import { useToast } from '../../components/ToastProvider/ToastProvider';
import { useAuth } from '../../context/AuthContext';

const initialValues = {
    email: '',
    password: '',
};

const SignIn = () => {

    // Hooks
    const navigate = useNavigate();
    const apiRequest = useApiRequest();
    const { login } = useAuth();
    const { showToast } = useToast();

    // State
    const [showPassword, setShowPassword] = useState(false);

    const handleToggleVisibility = () => setShowPassword((prev) => !prev);

    const validationSchema = Yup.object({
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
            email: values.email,
            password: values.password,
        }

        const { data, status, error } = await apiRequest('/api/auth/login', 'POST', passdata);

        if (status === 200) {
            login(data.token);
            showToast(data.message, "success");
            navigate("/admin/dashboard");
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
                        Login to your account
                    </Typography>
                    <Formik
                        initialValues={initialValues}
                        validationSchema={validationSchema}
                        onSubmit={handleSubmit}
                    >
                        {({ errors, handleChange, values, handleBlur, touched }) => (
                            <Form style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "10px" }}>
                                {/* Email */}
                                <FormControl fullWidth error={Boolean(errors.email)}>
                                    <Typography sx={{ mx: 0.5, mb: 0.4 }}>Email Address</Typography>
                                    <TextField
                                        id="email"
                                        name="email"
                                        type='email'
                                        placeholder="Email"
                                        value={values.email}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        error={touched.email && Boolean(errors.email)}
                                        helperText={touched.email && errors.email}
                                        autoComplete="email"
                                    />
                                </FormControl>

                                {/* Password */}
                                <FormControl fullWidth error={Boolean(errors.password)}>
                                    <Typography sx={{ mx: 0.5, mb: 0.4 }}>Password</Typography>
                                    <TextField
                                        id="password"
                                        name="password"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Password"
                                        value={values.password}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        error={touched.password && Boolean(errors.password)}
                                        helperText={touched.password && errors.password}
                                        autoComplete="password"
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

                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        <Checkbox color='default' />
                                        <Typography sx={{ letterSpacing: "0.03333em", fontSize: "0.938rem", fontWeight: "500" }}>Remember Me</Typography>
                                    </div>
                                    <Typography sx={{ textDecoration: "underline", color: "#ff0101", cursor: "pointer" }}>
                                        Forgot Password?
                                    </Typography>
                                </div>

                                <Button type="submit" variant="contained" color="primary" fullWidth sx={{ backgroundColor: "black", borderRadius: "10px", padding: "10px 0px", fontWeight: "500", fontSize: "18px" }}>
                                    Sign In
                                </Button>
                                {/* <Typography sx={{ textDecoration: "underline", color: "#ff0101", cursor: "pointer" }} onClick={() => navigate("/admin/signup")}>
                                    Sign up now
                                </Typography> */}
                            </Form>
                        )}
                    </Formik>
                </div>
            </Grid>
        </Grid>
    );
};

export default SignIn;
