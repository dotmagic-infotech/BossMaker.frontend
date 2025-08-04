// React Imports
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

// Mui Imports
import { TextField, Box, Typography, FormControl, FormHelperText, Button, Grid, Select, MenuItem, Checkbox, ListItemText, ListItem, styled, IconButton } from '@mui/material';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import Radio from '@mui/joy/Radio';
import CreateOutlinedIcon from '@mui/icons-material/CreateOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import CloseIcon from '@mui/icons-material/Close';

// Third Party imports
import * as Yup from 'yup';
import { Formik, Form } from 'formik';

// Custom Component
import { useCategory } from '../../context/CategoryContext';
import { useApiRequest } from '../../components/UseApiRequest/useApiRequest';
import { useToast } from '../../components/ToastProvider/ToastProvider';
import { useAuth } from '../../context/AuthContext';
import AddSections from './AddSections';

const initialValues = {
    title: '',
    description: '',
    sections: [],
    category: "",
    status: "active",
    instructor_ids: "",
    participant_ids: [],
    course_image: [],
};

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
    PaperProps: {
        style: {
            maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
            width: 250,
        },
    },
};

const VisuallyHiddenInput = styled('input')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 1,
});

function AddCourse() {

    // Hooks
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const { categoryData, refetchCategories, instructors, refetchInstructors, participants, refetchParticipants } = useCategory();
    const { showToast } = useToast();
    const apiRequest = useApiRequest();

    // State
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState(initialValues);
    const [category, setCategory] = useState([]);
    const [open, setOpen] = useState(false);
    const [removeFile, setRemoveFile] = useState([]);
    const [selectedSection, setSelectedSection] = useState(null);

    console.log("removeFile::", removeFile)

    console.log("formData", formData);

    const fetchUserByCategory = async (id) => {
        try {
            const { data, status, error } = await apiRequest(`/api/categories/finduserbycategory/${id}`, 'GET');
            if (status === 200) {

                setCategory(data.data);
            } else {
                showToast(error, "error");
            }
        } catch (error) {
            showToast("Failed to fetch course.", "error");
        }
    };

    const fetchIdByCourse = async () => {
        try {
            const { data, status, error } = await apiRequest(`/api/course/${id}`, 'GET');
            if (status === 200) {
                const course = data.course;

                course.category = course.category_id?._id;
                course.instructor_ids = course.instructor_ids || "";
                course.participant_ids = course.participant_ids?.map(role => role._id) || [];
                course.course_image = course.course_image;
                course.status = course.status === true ? "active" : "inactive";

                setFormData(course);

                if (user?.user_type === 1 && course.instructor_ids) {
                    fetchUserByCategory(course.instructor_ids);
                }
            } else {
                showToast(error, "error");
            }
        } catch (error) {
            showToast("Failed to fetch course.", "error");
        }
    };

    useEffect(() => {
        if (id) {
            user?.user_type === 1 ? refetchInstructors() : refetchParticipants();
            fetchIdByCourse();
            user?.user_type === 2 && refetchCategories();
        } else {
            user?.user_type === 1 ? refetchInstructors() : refetchParticipants();
            user?.user_type === 2 && refetchCategories();
        }
    }, []);

    const roleCategory = user?.user_type === 1 ? category : categoryData;

    const handleEdit = (course) => {
        setSelectedSection(course);
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setSelectedSection(null);
    };

    const validationSchema = Yup.object({
        title: Yup.string().required("Course Title required"),
        description: Yup.string().required("Description required"),
        instructor_ids: user?.user_type === 1 ? Yup.string().required("Instructor required") : Yup.string(),
        participant_ids: user?.user_type === 2 ? Yup.array().min(1, "At least one participant required") : Yup.array(),
        category: Yup.string().required("Category required"),
        course_image: Yup.mixed().required("Course Image required"),
    });

    const handleSubmit = async (values) => {
        setLoading(true);

        const passData = {
            title: values.title,
            description: values.description,
            category_id: values.category,
            status: values.status === 'active',
            sections: values.sections || [],
            ...(user?.user_type === 1
                ? { instructor_ids: values.instructor_ids }
                : { participant_ids: JSON.stringify(values.participant_ids) }
            ),
        };

        try {
            if (values.course_image instanceof File) {
                const imageFormData = new FormData();
                imageFormData.append("file", values.course_image);

                const { data: uploadRes, status: uploadStatus, error: uploadError } = await apiRequest(`/api/uploadFile`, 'POST', imageFormData, true);

                if (uploadStatus === 200) {
                    passData.course_image = uploadRes.data;
                } else {
                    showToast(uploadError || "Image upload failed", "error");
                    setLoading(false);
                    return;
                }
            } else {
                passData.course_image = values.course_image;
            }

            if (Array.isArray(values.sections) && values.sections.length > 0) {
                const uploadedSections = [];

                for (const section of values.sections) {
                    const uploadedSection = {
                        title: section.title,
                        lesson: section.lesson,
                        image: [],
                        video: [],
                        document: [],
                    };

                    for (const type of ["image", "video", "document"]) {
                        if (Array.isArray(section[type])) {
                            for (const file of section[type]) {
                                if (file instanceof File) {
                                    const fileFormData = new FormData();
                                    fileFormData.append("file", file);

                                    const { data: uploadRes, status: uploadStatus, error: uploadError } = await apiRequest(`/api/uploadFile`, 'POST', fileFormData, true);

                                    if (uploadStatus === 200) {
                                        uploadedSection[type].push(uploadRes.data);
                                    } else {
                                        showToast(uploadError || `${type} upload failed`, "error");
                                        setLoading(false);
                                        return;
                                    }
                                } else {
                                    uploadedSection[type].push(file);
                                }
                            }
                        }
                    }

                    uploadedSections.push(uploadedSection);
                }

                passData.sections = uploadedSections;
            }

            // Delete removed files
            if (Array.isArray(removeFile) && removeFile.length > 0) {
                const { status: deleteStatus, error: deleteError } =
                    await apiRequest(`/api/uploadFile/delete`, 'DELETE', { ids: removeFile });

                if (deleteStatus !== 200) {
                    showToast(deleteError || "Failed to delete files.", "error");
                }
            }

            // Save or update course
            const endpoint = id ? `/api/course/update/${id}` : `/api/course/create`;
            const method = id ? 'PUT' : 'POST';

            const { data, status, error } = await apiRequest(endpoint, method, passData);

            if (status === 200) {
                showToast(data.message, "success");
                setRemoveFile([]);
                navigate("/admin/course");
            } else {
                showToast(error || "Course submission failed", "error");
            }
        } catch (err) {
            showToast("Failed to update course.", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box style={{ padding: "1.25rem", height: "100%", overflowY: "auto" }}>
            <div>
                <Typography variant='subtitle1' fontSize="1.5rem" fontWeight={500}>{id ? "Update" : "Create"} Course</Typography>
                <Typography variant='subtitle2' fontWeight={500}>Details about the course</Typography>
            </div>
            <Grid container spacing={2} justifyContent="center" my={2}>
                <Formik
                    initialValues={formData}
                    enableReinitialize
                    validationSchema={validationSchema}
                    onSubmit={handleSubmit}
                >
                    {({ errors, handleChange, values, handleBlur, touched, setFieldValue }) => (
                        <Form style={{ width: "100%", display: "flex", flexDirection: "column", gap: "1rem", marginTop: "0.5rem" }}>
                            <Box sx={{ display: "flex", gap: "2rem", width: "100%" }}>
                                <FormControl fullWidth error={Boolean(errors.title)}>
                                    <Typography sx={{ mx: 0.5, mb: 0.4 }}>Course Title</Typography>
                                    <TextField
                                        id="title"
                                        name="title"
                                        type='text'
                                        placeholder="Course Title"
                                        value={values.title}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        error={touched.title && Boolean(errors.title)}
                                        helperText={touched.title && errors.title}
                                    />
                                </FormControl>
                                <FormControl fullWidth>
                                    <Typography sx={{ mx: 0.5, mb: 0.4 }}>Status</Typography>
                                    <ListItem sx={{ padding: "10px 0px", gap: "1rem" }}>
                                        <Radio checked={values.status === 'active'} onChange={handleChange} value="active" label="Active" name="status" size='md' />
                                        <Radio checked={values.status === 'inactive'} onChange={handleChange} value="inactive" label="Inactive" name="status" size='md' />
                                    </ListItem>
                                </FormControl>
                            </Box>

                            <Box sx={{ display: "flex", gap: "2rem", width: "100%" }}>
                                {user?.user_type === 1 ? (
                                    <FormControl fullWidth error={Boolean(errors.instructor_ids)}>
                                        <Typography sx={{ mx: 0.5, mb: 0.4 }}>Instructors</Typography>
                                        <Select
                                            displayEmpty
                                            id="instructor_ids"
                                            name="instructor_ids"
                                            MenuProps={MenuProps}
                                            value={values.instructor_ids || []}
                                            onChange={(e) => {
                                                handleChange(e);
                                                const selectedId = e.target.value;
                                                if (selectedId) {
                                                    fetchUserByCategory(selectedId);
                                                    setFieldValue('category', '');
                                                }
                                            }}
                                            onBlur={handleBlur}
                                            renderValue={(selected) => {
                                                if (!selected || selected.length === 0) {
                                                    return <span style={{ color: '#aaa' }}>Select Instructors</span>;
                                                }
                                                const person = instructors.find((n) => n._id === selected);
                                                return person ? `${person.first_name} ${person.last_name}` : '';
                                            }}
                                        >
                                            <MenuItem disabled value=""><em>Select Instructors</em></MenuItem>
                                            {instructors.map((person) => (
                                                <MenuItem key={person._id} value={person._id}>
                                                    <ListItemText primary={`${person.first_name} ${person.last_name}`} />
                                                </MenuItem>
                                            ))}
                                        </Select>

                                        {errors.instructor_ids && (
                                            <FormHelperText>{errors.instructor_ids}</FormHelperText>
                                        )}
                                    </FormControl>
                                ) : (
                                    <FormControl fullWidth error={Boolean(errors.participant_ids)}>
                                        <Typography sx={{ mx: 0.5, mb: 0.4 }}>Participants</Typography>
                                        <Select
                                            multiple
                                            displayEmpty
                                            label=""
                                            id="participant_ids"
                                            name="participant_ids"
                                            MenuProps={MenuProps}
                                            value={values.participant_ids || []}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            renderValue={(selected) => {
                                                if (!selected || selected.length === 0) {
                                                    return <span style={{ color: '#aaa' }}>Select Participants</span>;
                                                }

                                                return selected
                                                    .map((id) => {
                                                        const person = participants.find((n) => n._id === id);
                                                        return person ? `${person.first_name} ${person.last_name}` : '';
                                                    })
                                                    .join(', ');
                                            }}
                                        >
                                            <MenuItem value="" disabled><em>Select Participants</em></MenuItem>
                                            {participants.map((person) => (
                                                <MenuItem key={person._id} value={person._id}>
                                                    <Checkbox color='black' checked={values.participant_ids?.includes(person._id)} />
                                                    <ListItemText primary={`${person.first_name} ${person.last_name}`} />
                                                </MenuItem>
                                            ))}
                                        </Select>

                                        {errors.participant_ids && (
                                            <FormHelperText>{errors.participant_ids}</FormHelperText>
                                        )}
                                    </FormControl>
                                )}
                                <FormControl fullWidth error={Boolean(errors.category)}>
                                    <Typography sx={{ mx: 0.5, mb: 0.4 }}>Category</Typography>
                                    <Select
                                        id="category"
                                        name="category"
                                        value={values.category}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        displayEmpty
                                        renderValue={(selected) => {
                                            if (!selected) { }
                                            const category = roleCategory.find((cat) => cat._id === selected);
                                            return category ? category.name : <span style={{ color: '#aaa' }}>Select Category</span>;
                                        }}
                                    >
                                        <MenuItem disabled value="">
                                            <em>Select Category</em>
                                        </MenuItem>
                                        {roleCategory.length > 0 && roleCategory.map((category) => (
                                            <MenuItem key={category._id} value={category._id}>{category.name}</MenuItem>
                                        ))}
                                    </Select>
                                    {touched.category && Boolean(errors.category) && (
                                        <FormHelperText>{errors.category}</FormHelperText>
                                    )}
                                </FormControl>
                            </Box>

                            <Box sx={{ display: "flex", gap: "2rem", width: "100%" }}>
                                <FormControl fullWidth error={Boolean(errors.description)}>
                                    <Typography sx={{ mx: 0.5, mb: 0.4 }}>Description</Typography>
                                    <TextField
                                        id="description"
                                        type='text'
                                        multiline
                                        rows={4}
                                        placeholder="Description"
                                        value={values.description}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        error={touched.description && Boolean(errors.description)}
                                        helperText={touched.description && errors.description}
                                    />
                                </FormControl>
                                <FormControl fullWidth>
                                    <Typography sx={{ mx: 0.5, mb: 0.4 }}>Course Image</Typography>
                                    <Box component="label" role={undefined} tabIndex={-1} sx={{ border: '1px dashed #ccc', borderRadius: '8px', p: "6px" }}>
                                        {(values.course_image?.preview || values.course_image?.file_path) ? (
                                            <Box sx={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>
                                                <img
                                                    src={values.course_image.preview || `${import.meta.env.VITE_API_URL}/${values.course_image?.file_path}`}
                                                    alt="Course Preview"
                                                    style={{ width: 120, height: 120, objectFit: "cover", borderRadius: 8 }}
                                                />
                                                <IconButton sx={{ position: 'absolute', top: 0, right: 0, padding: '4px', color: '#fff', bgcolor: 'rgba(0,0,0,0.6)', '&:hover': { bgcolor: 'black' } }}
                                                    onClick={async (e) => {
                                                        e.stopPropagation();
                                                        if (values.course_image?._id) {
                                                            setRemoveFile((prev) => [...prev, values.course_image?._id]);
                                                        }
                                                        setFieldValue("course_image", null);
                                                    }}
                                                >
                                                    <CloseIcon fontSize="small" />
                                                </IconButton>
                                            </Box>
                                        ) : (
                                            <Box sx={{ py: 4, cursor: "pointer" }}>
                                                <Typography textAlign="center" fontWeight={700}>
                                                    Drop file here or click to upload
                                                </Typography>
                                                <Typography textAlign="center">
                                                    JPG, PNG, PDF, or Video files. Max file size 3MB.
                                                </Typography>
                                            </Box>
                                        )}
                                        <VisuallyHiddenInput
                                            type="file"
                                            id="course_image"
                                            name='course_image'
                                            accept='image/*'
                                            onBlur={handleBlur}
                                            onChange={(event) => {
                                                const file = event.currentTarget.files[0];
                                                if (file) {
                                                    const imageWithPreview = Object.assign(file, {
                                                        preview: URL.createObjectURL(file),
                                                    });

                                                    setFieldValue("course_image", imageWithPreview);
                                                }
                                            }}
                                        />
                                    </Box>
                                    {touched.course_image && Boolean(errors.course_image) && (
                                        <FormHelperText error>{errors.course_image}</FormHelperText>
                                    )}
                                </FormControl>
                            </Box>

                            {/* Section Description */}
                            <Box>
                                {formData?.sections.length > 0 && <Typography sx={{ mx: 0.5, mb: 0.4 }}>Sections</Typography>}
                                {formData?.sections.length > 0 && formData?.sections.map((section, index) => (
                                    <Box key={index} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", my: 1, p: 2, backgroundColor: '#f9f9f9', border: "1px solid #ccc", borderRadius: "8px" }}>
                                        <Box>
                                            <Typography variant="h6">{section.title}</Typography>
                                        </Box>
                                        <Box sx={{ display: "flex", gap: "10px" }}>
                                            <Button variant="outlined" color="primary" onClick={() => handleEdit(section)} startIcon={<CreateOutlinedIcon />}>
                                                Edit
                                            </Button>
                                            <Button variant="outlined" color="error" startIcon={<DeleteOutlineOutlinedIcon />}
                                                onClick={() => {
                                                    const updatedSections = formData?.sections.filter((s) => s !== section);
                                                    setFormData({ ...formData, sections: updatedSections });
                                                }}
                                            >
                                                Delete
                                            </Button>
                                        </Box>
                                    </Box>
                                ))}
                            </Box>

                            <Box>
                                <Button variant="contained" color="primary" sx={{ bgcolor: "black", borderRadius: "10px", padding: "5px 10px", fontWeight: "500", fontSize: "18px" }} startIcon={<AddOutlinedIcon />} onClick={() => {
                                    setSelectedSection(null);
                                    setOpen(true);
                                }}>
                                    Add Section
                                </Button>
                            </Box>

                            {/* Save Cancel Button */}
                            <Box sx={{ display: "flex", justifyContent: "end", gap: "10px", width: "100%", my: 2 }}>
                                <Button loading={loading} type="submit" variant="contained" color="primary" sx={{ backgroundColor: "black", width: "100px", borderRadius: "10px", padding: "10px", fontWeight: "500", fontSize: "18px" }}>
                                    {id ? "Update" : "Save"}
                                </Button>
                                <Button variant="contained" color="" sx={{ backgroundColor: "white", width: "100px", borderRadius: "10px", padding: "10px", fontWeight: "500", fontSize: "18px" }}
                                    onClick={() => navigate("/admin/course")}>
                                    Cancel
                                </Button>
                            </Box>
                        </Form>
                    )}
                </Formik>
            </Grid>

            <AddSections
                open={open}
                courseRecord={formData}
                setCourseRecord={setFormData}
                handleClose={handleClose}
                selectedSection={selectedSection}
                setRemoveFile={setRemoveFile}
            />
        </Box>
    )
}

export default AddCourse