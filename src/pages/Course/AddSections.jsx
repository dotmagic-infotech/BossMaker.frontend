// React Imports
import { useEffect, useState } from 'react';

// Mui Imports
import { Box, Button, Dialog, DialogContent, DialogTitle, Divider, FormControl, FormHelperText, IconButton, styled, TextField, Typography } from '@mui/material';
import PictureAsPdfOutlinedIcon from '@mui/icons-material/PictureAsPdfOutlined';
import PlayCircleOutlinedIcon from '@mui/icons-material/PlayCircleOutlined';
import CloseIcon from '@mui/icons-material/Close';

// Formik Yup
import * as Yup from 'yup';
import { Formik, Form } from 'formik';

const initialValues = {
    _id: "",
    title: '',
    lesson: '',
    image: [],
    video: [],
    document: [],
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

const UploadField = ({ label, name, accept, icon, values, touched, errors, setFieldValue, setRemoveFile }) => (
    <FormControl fullWidth>
        <Typography sx={{ mx: 0.5, mb: 0.4 }}>{label}</Typography>
        <Button component="label" variant="outlined">
            Upload {label}
            <VisuallyHiddenInput
                type="file"
                accept={accept}
                multiple
                onChange={(e) => {
                    const files = Array.from(e.currentTarget.files || []);
                    const withPreview = files.map(file =>
                        Object.assign(file, { preview: URL.createObjectURL(file) })
                    );
                    setFieldValue(name, [...(values[name] || []), ...withPreview]);
                }}
            />
        </Button>
        {touched[name] && Boolean(errors[name]) && (
            <FormHelperText error>{errors[name]}</FormHelperText>
        )}
        {values[name]?.length > 0 && (
            <Box mt={2} display="flex" flexWrap="wrap" gap={2}>
                {values[name].map((file, index) => (
                    <Box
                        key={index}
                        display="flex"
                        alignItems="center"
                        gap={1}
                        sx={{
                            position: 'relative', border: '1px solid #ccc', borderRadius: '8px',
                            padding: '8px 12px', backgroundColor: '#f9f9f9',
                            width: name === 'image' ? '146px' : 'auto', cursor: 'pointer',
                        }}
                        onClick={() => {
                            const fileUrl = file.preview || `${import.meta.env.VITE_API_URL}/${file?.file_path}`;

                            if (name === 'video') {
                                const w = window.open("");
                                if (w) {
                                    w.document.write(`
                                        <video controls autoplay style="width:100%; height:100vh;">
                                        <source src="${fileUrl}" type="video/mp4">
                                        Your browser does not support the video tag.
                                        </video>
                                    `);
                                }
                            } else if (name === 'document') {
                                window.open(fileUrl, '_blank');
                            }
                        }}
                    >
                        <IconButton
                            sx={{
                                position: 'absolute', top: '-11px', right: '-11px', padding: '4px',
                                color: '#fff', bgcolor: 'black',
                                '&:hover': { bgcolor: 'black' }
                            }}
                            onClick={() => {
                                const updated = values[name].filter((_, i) => i !== index);
                                setFieldValue(name, updated);
                                if (file._id) setRemoveFile((prev) => [...prev, file._id]);
                            }}
                        >
                            <CloseIcon fontSize="small" />
                        </IconButton>
                        {name === 'image' ? (
                            <img
                                src={file.preview || `${import.meta.env.VITE_API_URL}/${file?.file_path}`}
                                alt="preview"
                                style={{ width: "100%", maxHeight: "180px", objectFit: "contain" }}
                            />
                        ) : (
                            <>
                                {icon}
                                <Typography variant="body2" noWrap maxWidth={500}>
                                    {file.name || file?.file_name}
                                </Typography>
                            </>
                        )}
                    </Box>
                ))}
            </Box>
        )}
    </FormControl>
);

export default function AddSections({ open, handleClose, courseRecord, setCourseRecord, selectedSection, setRemoveFile }) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState(initialValues);

    useEffect(() => {
        if (selectedSection) {
            setFormData({
                _id: selectedSection._id || '',
                title: selectedSection.title || '',
                lesson: selectedSection.lesson || '',
                image: selectedSection.image || [],
                video: selectedSection.video || [],
                document: selectedSection.document || [],
            });
        } else {
            setFormData(initialValues);
        }
    }, [selectedSection]);

    const validationSchema = Yup.object({
        title: Yup.string().required('Section Title is required'),
        image: Yup.array().min(1, 'At least one image is required').required(),
        video: Yup.array().min(1, 'At least one video is required').required(),
        document: Yup.array().min(1, 'At least one document is required').required(),
    });

    const handleSubmit = async (values) => {
        setLoading(true);
        if (selectedSection) {
            setCourseRecord(prev => ({
                ...prev,
                sections: prev.sections.map(section =>
                    section._id === selectedSection._id ? { ...section, ...values } : section
                )
            }));
        } else {
            const newSectionId = courseRecord?.sections?.length + 1 || 1;
            setCourseRecord(prev => ({
                ...prev,
                sections: [...prev.sections, { ...values, _id: newSectionId }]
            }));
        }

        setLoading(false);
        handleClose();
    };

    return (
        <Dialog fullWidth open={open} onClose={handleClose}>
            <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                {selectedSection ? "Update" : "Add"} Section
                <IconButton onClick={handleClose} sx={{ border: "1px solid black" }}>
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
                    {({ errors, handleChange, values, handleBlur, touched, setFieldValue }) => (
                        <Form style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "0.5rem" }}>
                            <FormControl fullWidth>
                                <Typography sx={{ mx: 0.5, mb: 0.4 }}>Section Title</Typography>
                                <TextField
                                    name='title'
                                    placeholder="Section Title"
                                    value={values.title}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={touched.title && Boolean(errors.title)}
                                    helperText={touched.title && errors.title}
                                />
                            </FormControl>

                            <FormControl fullWidth>
                                <Typography sx={{ mx: 0.5, mb: 0.4 }}>Text Lesson</Typography>
                                <TextField
                                    name='lesson'
                                    multiline
                                    rows={4}
                                    placeholder="Text Lesson"
                                    value={values.lesson}
                                    onChange={handleChange}
                                />
                            </FormControl>

                            <UploadField
                                label="Image"
                                name="image"
                                accept="image/*"
                                icon={null}
                                values={values}
                                touched={touched}
                                errors={errors}
                                setFieldValue={setFieldValue}
                                setRemoveFile={setRemoveFile}
                            />

                            <UploadField
                                label="Video"
                                name="video"
                                accept="video/*"
                                icon={<PlayCircleOutlinedIcon fontSize="large" />}
                                values={values}
                                touched={touched}
                                errors={errors}
                                setFieldValue={setFieldValue}
                                setRemoveFile={setRemoveFile}
                            />

                            <UploadField
                                label="Document"
                                name="document"
                                accept="application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                icon={<PictureAsPdfOutlinedIcon fontSize="large" />}
                                values={values}
                                touched={touched}
                                errors={errors}
                                setFieldValue={setFieldValue}
                                setRemoveFile={setRemoveFile}
                            />

                            <Divider sx={{ mx: -3 }} />

                            <Box sx={{ display: "flex", justifyContent: "end", gap: "10px" }}>
                                <Button loading={loading} type='submit' variant="contained" sx={{ bgcolor: "black", width: "100px", borderRadius: "10px", fontWeight: "500", fontSize: "18px" }}>
                                    {selectedSection ? "Update" : "Add"}
                                </Button>
                                <Button variant="contained" sx={{ bgcolor: "white", color: "black", width: "100px", borderRadius: "10px", fontWeight: "500", fontSize: "18px" }}
                                    onClick={handleClose}>
                                    Cancel
                                </Button>
                            </Box>
                        </Form>
                    )}
                </Formik>
            </DialogContent>
        </Dialog>
    );
}
