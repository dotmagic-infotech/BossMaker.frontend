// React imports
import { useEffect, useState } from 'react';

// Mui imports
import { Box, Button, Dialog, DialogContent, DialogTitle, Divider, FormControl, FormHelperText, IconButton, styled, TextField, Typography } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close';
import PictureAsPdfOutlinedIcon from '@mui/icons-material/PictureAsPdfOutlined';
import PlayCircleOutlinedIcon from '@mui/icons-material/PlayCircleOutlined';

// Third Party imports
import * as Yup from 'yup';
import { Formik, Form } from 'formik';

const initialValues = {
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

export default function AddSections({ open, handleClose, courseRecord, setCourseRecord, selectedSection }) {

    // state
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState(initialValues);

    useEffect(() => {
        if (selectedSection) {
            const addTimestampAndPreview = (urlArray, type) =>
                urlArray.map((url) => {
                    const filename = url.split('/').pop();
                    return {
                        name: filename,
                        preview: url,
                        lastModified: Date.now(),
                        type,
                        url,
                        createdAt: new Date().toISOString()
                    };
                });

            const transformedData = {
                title: selectedSection.title || '',
                lesson: selectedSection.lesson || '',
                image: selectedSection.image[0]?.type ? selectedSection.image : addTimestampAndPreview(selectedSection.image || [], 'image/*'),
                video: selectedSection.video[0]?.type ? selectedSection.video : addTimestampAndPreview(selectedSection.video || [], 'video/*'),
                document: selectedSection.document[0]?.type ? selectedSection.document : addTimestampAndPreview(selectedSection.document || [], 'application/*'),
            };

            setFormData(transformedData);
        } else {
            setFormData(initialValues);
        }
    }, [selectedSection]);

    const validationSchema = Yup.object({
        title: Yup.string()
            .required('Section Title is required'),
        image: Yup.array()
            .min(1, 'At least one image is required')
            .required('Image is required'),
        video: Yup.array()
            .min(1, 'At least one video is required')
            .required('Video is required'),
        document: Yup.array()
            .min(1, 'At least one document is required')
            .required('Document is required')
    });

    const handleSubmit = async (values) => {
        setLoading(true);

        if (selectedSection) {
            setCourseRecord(prev => {
                const updatedSections = prev.sections.map(section =>
                    section._id === selectedSection._id
                        ? { ...section, ...values }
                        : section
                );

                return {
                    ...prev,
                    sections: updatedSections
                };
            });
        } else {
            const newSectionId = courseRecord?.sections?.length + 1 || 1;

            const updatedSection = {
                ...values,
                _id: newSectionId
            };

            setCourseRecord(prev => ({
                ...prev,
                sections: [...prev.sections, updatedSection]
            }));
        }

        setLoading(false);
        handleClose();
    };

    return (
        <Dialog fullWidth open={open} sx={{ borderRadius: "12px" }} onClose={handleClose}>
            <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                {selectedSection ? "Update" : "Add"} Section
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
                    {({ errors, handleChange, values, handleBlur, touched, setFieldValue }) => (
                        <Form style={{ width: "100%", display: "flex", flexDirection: "column", gap: "1rem", marginTop: "0.5rem" }}>
                            {/* title */}
                            <FormControl fullWidth>
                                <Typography sx={{ mx: 0.5, mb: 0.4 }}>Section Title</Typography>
                                <TextField
                                    name='title'
                                    type='text'
                                    placeholder="Section Title"
                                    value={values.title}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={touched.title && Boolean(errors.title)}
                                    helperText={touched.title && errors.title}
                                />
                            </FormControl>

                            {/* Text Lesson */}
                            <FormControl fullWidth>
                                <Typography sx={{ mx: 0.5, mb: 0.4 }}>Text Lesson</Typography>
                                <TextField
                                    name='lesson'
                                    type='text'
                                    multiline
                                    rows={4}
                                    placeholder="Text Lesson"
                                    value={values.lesson}
                                    onChange={handleChange}
                                />
                            </FormControl>

                            {/* Image Upload */}
                            <FormControl fullWidth>
                                <Typography sx={{ mx: 0.5, mb: 0.4 }}>Image Upload</Typography>
                                <Button component="label" role={undefined} variant="outlined" tabIndex={-1} className='upload-button'>
                                    Upload Image
                                    <VisuallyHiddenInput
                                        type="file"
                                        name='image'
                                        accept='image/*'
                                        multiple
                                        onBlur={handleBlur}
                                        onChange={(event) => {
                                            const files = Array.from(event.currentTarget.files || []);
                                            const imageFiles = files.map(file =>
                                                Object.assign(file, { preview: URL.createObjectURL(file) })
                                            );
                                            setFieldValue("image", [...(values.image || []), ...imageFiles]);
                                        }}
                                    />
                                </Button>
                                {touched.image && Boolean(errors.image) && (
                                    <FormHelperText error>{errors.image}</FormHelperText>
                                )}
                                {values.image && values.image.length > 0 && (
                                    <Box mt={2} display="flex" flexWrap="wrap" gap={2}>
                                        {values.image.map((file, index) => (
                                            <Box
                                                key={index}
                                                display="flex"
                                                alignItems="center"
                                                gap={1}
                                                sx={{
                                                    position: 'relative', border: '1px solid #ccc', borderRadius: '8px', padding: '8px 12px', backgroundColor: '#f9f9f9',
                                                    width: "146px"
                                                }}
                                            >
                                                <IconButton
                                                    sx={{
                                                        position: 'absolute', top: '-11px', right: '-11px', padding: '4px', color: '#fff', bgcolor: 'black',
                                                        '&:hover': {
                                                            bgcolor: 'black',
                                                        },
                                                    }}
                                                    onClick={() => {
                                                        const newFiles = values.image.filter((_, i) => i !== index);
                                                        setFieldValue("image", newFiles);
                                                    }}
                                                >
                                                    <CloseIcon fontSize="small" />
                                                </IconButton>
                                                <img
                                                    src={file.preview || URL.createObjectURL(file.image)}
                                                    alt="preview"
                                                    style={{ width: "100%", maxHeight: "180px", objectFit: "contain" }}
                                                />
                                            </Box>
                                        ))}
                                    </Box>
                                )}
                            </FormControl>

                            {/* Video Upload */}
                            <FormControl fullWidth>
                                <Typography sx={{ mx: 0.5, mb: 0.4 }}>Video Upload</Typography>
                                <Button component="label" role={undefined} variant="outlined" tabIndex={-1} className='upload-button'>
                                    Upload Video
                                    <VisuallyHiddenInput
                                        type="file"
                                        name='video'
                                        accept='video/*'
                                        onBlur={handleBlur}
                                        onChange={(event) => {
                                            const files = Array.from(event.currentTarget.files || []);
                                            const videoFiles = files.map(file =>
                                                Object.assign(file, { preview: URL.createObjectURL(file) })
                                            );
                                            setFieldValue("video", [...(values.video || []), ...videoFiles]);
                                        }}
                                        multiple
                                    />
                                </Button>
                                {touched.video && Boolean(errors.video) && (
                                    <FormHelperText error>{errors.video}</FormHelperText>
                                )}
                                {values.video && values.video.length > 0 && (
                                    <Box mt={2} display="flex" flexWrap="wrap" gap={2}>
                                        {values.video.map((file, index) => (
                                            <Box
                                                key={index}
                                                display="flex"
                                                alignItems="center"
                                                gap={1}
                                                sx={{
                                                    position: 'relative', border: '1px solid #ccc', borderRadius: '8px', padding: '8px 12px', backgroundColor: '#f9f9f9',
                                                }}
                                            >
                                                <IconButton
                                                    sx={{
                                                        position: 'absolute', top: '-11px', right: '-11px', padding: '4px', color: '#fff', bgcolor: 'black',
                                                        '&:hover': {
                                                            bgcolor: 'black',
                                                        },
                                                    }}
                                                    onClick={() => {
                                                        const newFiles = values.video.filter((_, i) => i !== index);
                                                        setFieldValue("video", newFiles);
                                                    }}
                                                >
                                                    <CloseIcon fontSize="small" />
                                                </IconButton>
                                                <PlayCircleOutlinedIcon fontSize="large" />
                                                <Typography variant="body2" noWrap maxWidth={500}>
                                                    {file.name}
                                                </Typography>
                                            </Box>
                                        ))}
                                    </Box>
                                )}
                            </FormControl>

                            {/* Document Upload */}
                            <FormControl fullWidth>
                                <Typography sx={{ mx: 0.5, mb: 0.4 }}>PDF / Document Upload</Typography>
                                <Button component="label" role={undefined} variant="outlined" tabIndex={-1} className='upload-button'>
                                    Upload Document
                                    <VisuallyHiddenInput
                                        type="file"
                                        name='image'
                                        accept='application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                                        onBlur={handleBlur}
                                        onChange={(event) => {
                                            const files = Array.from(event.currentTarget.files || []);
                                            const updatedDocs = files.map(file =>
                                                Object.assign(file, { preview: URL.createObjectURL(file) })
                                            );
                                            setFieldValue("document", [...(values.document || []), ...updatedDocs]);
                                        }}
                                        multiple
                                    />
                                </Button>
                                {touched.document && Boolean(errors.document) && (
                                    <FormHelperText error>{errors.document}</FormHelperText>
                                )}
                                {values.document && values.document.length > 0 && (
                                    <Box mt={2} display="flex" flexWrap="wrap" gap={2}>
                                        {values.document.map((file, index) => (
                                            <Box
                                                key={index}
                                                display="flex"
                                                alignItems="center"
                                                gap={1}
                                                sx={{
                                                    position: 'relative', border: '1px solid #ccc', borderRadius: '8px', padding: '8px 12px', backgroundColor: '#f9f9f9',
                                                }}
                                            >
                                                <IconButton
                                                    sx={{
                                                        position: 'absolute', top: '-11px', right: '-11px', padding: '4px', color: '#fff', bgcolor: 'black',
                                                        '&:hover': {
                                                            bgcolor: 'black',
                                                        },
                                                    }}
                                                    onClick={() => {
                                                        const newFiles = values.document.filter((_, i) => i !== index);
                                                        setFieldValue("document", newFiles);
                                                    }}
                                                >
                                                    <CloseIcon fontSize="small" />
                                                </IconButton>
                                                <PictureAsPdfOutlinedIcon fontSize="large" />
                                                <Typography variant="body2" noWrap maxWidth={500}>
                                                    {file.name}
                                                </Typography>
                                            </Box>
                                        ))}
                                    </Box>
                                )}
                            </FormControl>

                            <Divider sx={{ margin: "0px -24px" }} />

                            <Box sx={{ display: "flex", justifyContent: "end", gap: "10px", width: "100%" }}>
                                <Button type='submit' variant="contained" color="primary" loading={loading} sx={{ backgroundColor: "black", width: "100px", borderRadius: "10px", padding: "10px", fontWeight: "500", fontSize: "18px" }}>
                                    {selectedSection ? "Update" : "Add"}
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
    )
}