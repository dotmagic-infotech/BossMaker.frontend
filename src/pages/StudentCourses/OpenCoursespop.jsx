// Mui imports
import { Dialog, DialogContent, DialogTitle, IconButton, Typography } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close';

export default function OpenCoursespop({ open, handleClose, selectedCourse }) {

    return (
        <Dialog fullScreen open={open} onClose={handleClose} >
            <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                {selectedCourse?.name}
                <IconButton color='inherit' sx={{ border: "1px solid black" }} onClick={handleClose}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent dividers>
                <img src={selectedCourse?.image} alt={selectedCourse?.name} style={{ width: '500px', height: "500px", borderRadius: '0.5rem', marginBottom: '1rem' }} />
                <Typography variant="h6" gutterBottom>{selectedCourse?.category}</Typography>
                <Typography variant="body1">{selectedCourse?.description}</Typography>
            </DialogContent>
        </Dialog>
    )
}