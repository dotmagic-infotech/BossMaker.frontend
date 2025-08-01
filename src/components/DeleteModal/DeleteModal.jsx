// Mui Imports
import { Modal, Card, Typography, Button, Box } from '@mui/material';

const DeleteModal = ({
    open,
    title = "Delete Confirmation",
    description = "Are you sure you want to delete this?",
    onClose,
    onDelete
}) => {
    return (
        <Modal open={open} onClose={onClose}>
            <Card
                sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 400,
                    bgcolor: 'background.paper',
                    boxShadow: 24,
                    p: 2,
                    borderRadius: '1.2rem',
                }}
            >
                <Typography variant='h6' textAlign="center" sx={{ mb: 2, fontWeight: 600 }}>{title}</Typography>

                <Typography sx={{ mb: 3 }} textAlign="center">{description}</Typography>

                <Box sx={{ display: "flex", justifyContent: "center", gap: "10px", width: "100%" }}>
                    <Button variant="contained" color="primary" sx={{ backgroundColor: "red", width: "100px", borderRadius: "10px", padding: "5px 10px", fontWeight: "500", fontSize: "18px" }}
                        onClick={onDelete}>
                        Delete
                    </Button>
                    <Button variant="contained" color="" sx={{ backgroundColor: "white", width: "100px", borderRadius: "10px", padding: "5px 10px", fontWeight: "500", fontSize: "18px" }}
                        onClick={onClose}>
                        Cancel
                    </Button>
                </Box>
            </Card>
        </Modal >
    );
};

export default DeleteModal;
