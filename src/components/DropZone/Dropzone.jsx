// React Imports
import { useCallback, useEffect, useState } from 'react';

// Mui Imports
import { Box, Button, Typography } from '@mui/material';

// Third-party Imports
import { useDropzone } from 'react-dropzone';

const Dropzone = ({ onDrop, name, preview = false, mode = "Button", selectedFile, multiple = false, accept = { 'image/*': [], 'application/pdf': [] } }) => {
    const [previewUrls, setPreviewUrls] = useState([]);

    const handleDrop = useCallback((files) => {
        onDrop(files);

        const newPreviews = files.map(file => {
            if (file.type.startsWith('image/')) {
                return { type: 'image', url: URL.createObjectURL(file), file };
            } else if (file.type === 'application/pdf') {
                return { type: 'pdf', url: URL.createObjectURL(file), file };
            }
            return null;
        }).filter(Boolean);

        setPreviewUrls(newPreviews);
    }, [onDrop]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop: handleDrop,
        accept,
        multiple,
    });

    useEffect(() => {
        return () => {
            previewUrls.forEach(p => {
                if (p.url.startsWith('blob:')) {
                    URL.revokeObjectURL(p.url);
                }
            });
        };
    }, [previewUrls]);

    return (
        <Box {...getRootProps()} sx={{ textAlign: 'center', cursor: 'pointer', bgcolor: isDragActive ? '#f0f0f0' : 'transparent' }}>
            <input {...getInputProps()} />

            {mode === "Button" ? (
                <Button variant="contained" sx={{ backgroundColor: "white", color: "black", width: "120px", borderRadius: "10px", padding: "10px", fontWeight: "500", fontSize: "18px" }}>
                    {name}
                </Button>
            ) : (
                <Box sx={{ border: '1px dashed #ccc', borderRadius: '8px', p: "6px" }}>
                    {preview && (previewUrls.length > 0 || selectedFile) ? (
                        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center', py: "4px" }}>
                            {previewUrls.length > 0 ? previewUrls.map((file, index) => (
                                <Box key={index}>
                                    {file.type === 'image' ? (
                                        <img src={file.url} alt={`Preview ${index}`} style={{ width: 100, height: 100, borderRadius: 8 }} />
                                    ) : (
                                        <embed src={file.url} type="application/pdf" width="100" height="100" />
                                    )}
                                </Box>
                            )) : (
                                <Box>
                                    <img src={selectedFile} alt="Selected File" style={{ width: 100, height: 100, borderRadius: 8 }} />
                                </Box>
                            )}
                        </Box>
                    ) : (
                        <Box sx={{ py: 4 }}>
                            <Typography textAlign="center" fontWeight={700}>
                                Drop file here or click to upload
                            </Typography>
                            <Typography textAlign="center">
                                JPG, PNG, PDF, or Video files. Max file size 3MB.
                            </Typography>
                        </Box>
                    )}
                </Box>
            )}
        </Box>
    );
};

export default Dropzone;
