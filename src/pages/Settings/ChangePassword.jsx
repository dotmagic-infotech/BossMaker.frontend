// React
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// MUI
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { FormControl, FormHelperText, IconButton, InputAdornment, TextField, Typography, Button, Box } from '@mui/material';

// Custom Hooks & Components
import { useToast } from '../../components/ToastProvider/ToastProvider';
import { useApiRequest } from '../../components/UseApiRequest/useApiRequest';

// Formik + Yup
import { Formik, Form } from 'formik';
import * as Yup from 'yup';

const initialValues = {
    old_password: '',
    new_password: '',
    confirm_password: '',
};

const ChangePassword = () => {

    // Hooks
    const navigate = useNavigate();
    const { showToast } = useToast();
    const apiRequest = useApiRequest();

    // State
    const [showOld, setShowOld] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const toggleOld = () => setShowOld((prev) => !prev);
    const toggleNew = () => setShowNew((prev) => !prev);
    const toggleConfirm = () => setShowConfirm((prev) => !prev);

    const PasswordField = ({ label, name, value, handleChange, handleBlur, error, touched, show, toggle }) => (
        <FormControl fullWidth error={Boolean(touched && error)}>
            <Typography sx={{ mx: 0.5, mb: 0.4 }}>{label}</Typography>
            <TextField
                id={name}
                name={name}
                type={show ? 'text' : 'password'}
                placeholder={label}
                value={value}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched && Boolean(error)}
                InputProps={{
                    endAdornment: (
                        <InputAdornment position="end">
                            <IconButton onClick={toggle} edge="end">
                                {show ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                        </InputAdornment>
                    ),
                }}
            />
            {touched && error && (
                <FormHelperText sx={{ mt: 0.5, mx: 0 }}>{error}</FormHelperText>
            )}
        </FormControl>
    );

    const validationSchema = Yup.object({
        old_password: Yup.string()
            .required('Required')
            .min(8, 'Min 8 chars')
            .matches(/[A-Z]/, '1 uppercase')
            .matches(/[a-z]/, '1 lowercase')
            .matches(/[0-9]/, '1 number')
            .matches(/[@$!%*?&]/, '1 special char'),
        new_password: Yup.string()
            .required('Required')
            .min(8, 'Min 8 chars')
            .matches(/[A-Z]/, '1 uppercase')
            .matches(/[a-z]/, '1 lowercase')
            .matches(/[0-9]/, '1 number')
            .matches(/[@$!%*?&]/, '1 special char')
            .notOneOf([Yup.ref('old_password')], 'New password must be different from old password'),
        confirm_password: Yup.string()
            .oneOf([Yup.ref('new_password'), null], 'Passwords must match')
            .required('Required'),
    });

    const handleSubmit = async (values) => {
        const { old_password, new_password, confirm_password } = values;
        const { data, status, error } = await apiRequest('/api/profile/changePassword', 'POST', {
            old_password,
            new_password,
            confirm_password,
        });

        if (status === 200) {
            showToast(data.message, 'success');
            navigate('/admin/dashboard');
        } else {
            showToast(error, 'error');
        }
    };

    return (
        <Box sx={{
            padding: 4,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center'
        }}>
            <Typography sx={{ marginBottom: 3, fontSize: '2.5rem' }} variant="h5" fontWeight={500}>
                Change Password
            </Typography>

            <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
            >
                {({ values, errors, touched, handleChange, handleBlur }) => (
                    <Form style={{ width: '100%', maxWidth: 300, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <PasswordField
                            label="Old Password"
                            name="old_password"
                            value={values.old_password}
                            handleChange={handleChange}
                            handleBlur={handleBlur}
                            error={errors.old_password}
                            touched={touched.old_password}
                            show={showOld}
                            toggle={toggleOld}
                        />

                        <PasswordField
                            label="New Password"
                            name="new_password"
                            value={values.new_password}
                            handleChange={handleChange}
                            handleBlur={handleBlur}
                            error={errors.new_password}
                            touched={touched.new_password}
                            show={showNew}
                            toggle={toggleNew}
                        />

                        <PasswordField
                            label="Confirm Password"
                            name="confirm_password"
                            value={values.confirm_password}
                            handleChange={handleChange}
                            handleBlur={handleBlur}
                            error={errors.confirm_password}
                            touched={touched.confirm_password}
                            show={showConfirm}
                            toggle={toggleConfirm}
                        />

                        <Button type="submit" sx={{ bgcolor: "black", color: "white", fontWeight: '500', padding: "12px", borderRadius: "10px" }} variant="outlined">
                            Save
                        </Button>
                    </Form>
                )}
            </Formik>
        </Box>
    );
};

export default ChangePassword;
