// Mui imports
import { Dialog, DialogContent, DialogTitle, IconButton, Typography } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close';

export default function OpenCoursespop({ open, handleClose, selectedCourse }) {

    return (
        <Dialog fullScreen open={open} onClose={handleClose} >
            <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "end" }}>
                {selectedCourse?.title}
                <IconButton color='inherit' sx={{ border: "1px solid black" }} onClick={handleClose}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent dividers>
                {selectedCourse?.course_image?.file_path &&
                  <img src={`${import.meta.env.VITE_API_URL}/${selectedCourse?.course_image?.file_path}`} loading="lazy" alt={selectedCourse?.course_image?.file_path} style={{ width: '100%', borderRadius: '0.5rem', marginBottom: "0.5rem" }} />
                }
                <Typography variant="h6" gutterBottom>{selectedCourse?.category_id?.name}</Typography>
                <Typography variant="body1">{selectedCourse?.description}</Typography>
            </DialogContent>
        </Dialog>
    )
}