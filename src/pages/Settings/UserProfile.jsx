// React Imports
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';

// Mui Imports
import { TextField, Grid, Box, Avatar, Typography, FormControl, Button, FormHelperText } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

// Third Party imports
import dayjs from 'dayjs';

// Formik + Yup
import { Formik, Form } from 'formik';
import * as Yup from 'yup';

// Custom Component
import { stringAvatar } from '../../utils/appUtils';
import PasswordField from '../../components/PasswordField/PasswordField';
import { useToast } from '../../components/ToastProvider/ToastProvider';
import { useApiRequest } from '../../components/UseApiRequest/useApiRequest';
import Dropzone from '../../components/DropZone/Dropzone';

const initialValues = {
  first_name: '',
  last_name: '',
  profile_image: '',
  email: '',
  mobile_no: '',
  dob: null,
  role: '',
  password: '',
};

function UserProfile() {

  // Hooks
  const navigate = useNavigate();
  const { showToast } = useToast();
  const apiRequest = useApiRequest();

  // State
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(initialValues);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleDrop = (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      file.preview = URL.createObjectURL(file);
      setSelectedFile(file);
    }
  };

  const fetchProfile = async () => {
    try {
      const { data, status, error } = await apiRequest(`/api/profile`, 'GET');
      if (status === 200) {
        const profile = data.data;

        profile.dob = profile.dob ? dayjs(profile.dob) : null;

        if (profile.user_type === 1) {
          profile.role = 'Admin';
        } else if (profile.user_type === 2) {
          profile.role = 'Member';
        } else if (profile.user_type === 3) {
          profile.role = 'Participant';
        } else {
          profile.role = 'Unknown';
        }

        setFormData(profile);
      } else {
        setFormData([]);
      }
    } catch (error) {
      showToast("Failed to fetch profile.", "error");
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const validationSchema = Yup.object({
    first_name: Yup.string().required('First name is required'),
    last_name: Yup.string().required('Last name is required'),
  });

  const handleSubmit = async (values) => {
    const formData = new FormData();

    formData.append('first_name', values.first_name);
    formData.append('last_name', values.last_name);
    formData.append('email', values.email);
    formData.append('mobile_no', values.mobile_no);
    formData.append('role', values.role);
    formData.append('dob', values.dob ? dayjs(values.dob).format('YYYY-MM-DD') : '');

    if (selectedFile instanceof File) {
      formData.append('profile_image', selectedFile);
    }

    setLoading(true);

    try {
      const { status, error } = await apiRequest(`/api/profile/update`, 'PUT', formData, true);
      if (status === 200) {
        showToast("Profile updated successfully.", "success");
      } else {
        showToast(error, "error");
      }
    } catch (error) {
      showToast("Failed to update profile.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "1.25rem", height: "100%", overflow: "auto" }}>
      <Typography variant='subtitle1' fontSize="1.5rem" fontWeight={500}>My Profile</Typography>

      <Grid display={"flex"} justifyContent="center" alignItems="center" sx={{ my: "2rem" }}>
        <Formik
          initialValues={formData}
          enableReinitialize
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ values, errors, handleChange, setFieldValue }) => (
            <Form style={{ width: '100%', maxWidth: 500, display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <Box
                component="section"
                display="flex"
                alignItems="center"
                flexDirection="column"
                gap="1rem"
                sx={{ height: "100%", padding: "1.5rem", overflowY: "auto" }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "1rem", width: "100%" }}>
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
                    name="Change"
                    selectedFile={selectedFile}
                    multiple={false}
                    accept={{ 'image/*': [] }}
                  />
                </div>

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
                <FormControl fullWidth error={Boolean(errors.email)}>
                  <Typography sx={{ mx: 0.5, mb: 0.4 }}>Email</Typography>
                  <TextField
                    id="email"
                    type='email'
                    disabled
                    placeholder="Email"
                    value={values.email}
                    onChange={handleChange}
                    error={errors.email}
                  />
                  {errors.email && (
                    <FormHelperText sx={{ mt: 0.5, mx: 0 }}>{errors.email}</FormHelperText>
                  )}
                </FormControl>
                <FormControl fullWidth error={Boolean(errors.mobile_no)}>
                  <Typography sx={{ mx: 0.5, mb: 0.4 }}>Mobile Number</Typography>
                  <TextField
                    id="mobile_no"
                    type='number'
                    placeholder="Mobile Number"
                    value={values.mobile_no}
                    onChange={handleChange}
                    error={errors.mobile_no}
                  />
                  {errors.mobile_no && (
                    <FormHelperText sx={{ mt: 0.5, mx: 0 }}>{errors.mobile_no}</FormHelperText>
                  )}
                </FormControl>
                <Box sx={{ display: "flex", gap: "10px", width: "100%" }}>
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
                  <FormControl fullWidth error={Boolean(errors.role)}>
                    <Typography sx={{ mx: 0.5, mb: 0.4 }}>Role</Typography>
                    <TextField
                      id="role"
                      disabled
                      placeholder='Role'
                      value={values.role}
                      onChange={handleChange}
                    />
                    {errors.role && (
                      <FormHelperText sx={{ mt: 0.5, mx: 0 }}>{errors.role}</FormHelperText>
                    )}
                  </FormControl>
                </Box>
                <FormControl fullWidth error={Boolean(errors.password)}>
                  <Typography sx={{ mx: 0.5, mb: 0.4 }}>Password</Typography>
                  <PasswordField
                    value={values.password}
                    onChange={handleChange}
                    disabled
                    fullWidth
                    label=''
                  />
                  {errors.password && (
                    <FormHelperText sx={{ mt: 0.5, mx: 0 }}>{errors.password}</FormHelperText>
                  )}
                </FormControl>
                <Box sx={{ display: 'flex', gap: "10px", justifyContent: "end", width: "100%" }}>
                  <Button variant="contained" color="" sx={{ backgroundColor: "white", width: "100px", borderRadius: "10px", padding: "10px", fontWeight: "500", fontSize: "18px" }} onClick={() => navigate("/admin/dashboard")}>
                    Cancel
                  </Button>

                  <Button type="submit" variant="contained" color="primary" loading={loading} sx={{ backgroundColor: "black", width: "100px", borderRadius: "10px", padding: "10px", fontWeight: "500", fontSize: "18px" }}>
                    Save
                  </Button>
                </Box>
              </Box>
            </Form>
          )}
        </Formik>
      </Grid>
    </div>
  )
}

export default UserProfile