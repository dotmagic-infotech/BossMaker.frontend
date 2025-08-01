// React Imports
import { useEffect, useState } from 'react'

// MUI Imports
import { Box, Button, Card, Grid, Typography } from '@mui/material'

// Custom Components
import OpenCoursespop from './OpenCoursespop';
import { useToast } from '../../components/ToastProvider/ToastProvider';
import { useApiRequest } from '../../components/UseApiRequest/useApiRequest';

export default function StudentCourses() {

  // Hooks
  const { showToast } = useToast();
  const apiRequest = useApiRequest();

  // State
  const [loading, setLoading] = useState(false);
  const [course, setCourse] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);

  const handleOpen = (course) => {
    setSelectedCourse(course);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedCourse(null);
  };

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const { data, status, error } = await apiRequest(`/api/course`, 'GET');
      if (status === 200) {
        setCourse(data.data);
      } else {
        showToast(error, "error");
        setCourse([]);
      }
    } catch (error) {
      showToast("Failed to fetch users.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const courses = [
    { _id: 1, name: "Bachelor of Commerce", category: "Mangement", description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.", image: "https://images.unsplash.com/photo-1527549993586-dff825b37782?auto=format&fit=crop&w=286", instructor: "Razz Antala", status: true },
    { _id: 2, name: "Master of Science in Computer Science", category: "BMU", description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.", image: "https://images.unsplash.com/photo-1527549993586-dff825b37782?auto=format&fit=crop&w=286", instructor: "Razz Antala", status: false },
    { _id: 3, name: "Master of Business Administration in Cybersecurity Leadership", category: "BMU", description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.", image: "https://images.unsplash.com/photo-1527549993586-dff825b37782?auto=format&fit=crop&w=286", instructor: "Razz Antala", status: true},
  ]

  return (
    <Box style={{ padding: "1.25rem", height: "100%", overflowY: "auto" }}>
      <Typography variant="h4" style={{ marginBottom: "1rem" }}>
        Courses
      </Typography>

      <Grid
        container
        spacing={{ xs: 2, md: 3 }}
        columns={{ xs: 4, sm: 8, md: 12 }}
      >
        {courses.map((v, index) => (
          <Grid key={index} size={{ xs: 12, sm: 12, md: 4 }}>
            <Card sx={{
              bgcolor: "rgb(245, 245, 245)",
              padding: "1rem", cursor: "pointer",
              borderRadius: "1rem", height: "100%",
              boxShadow: "rgba(0, 0, 0, 0.35) 0rem 0.125rem 0.3125rem",
              border: "0.0625rem solid rgb(170, 170, 170)",
              display: "flex", justifyContent: "space-between",
              flexDirection: "column",
            }}>
              <div>
                <img src={v.image} srcSet={`${v.image}&dpr=2 2x`} loading="lazy" alt="" style={{ width: '150px', borderRadius: '0.5rem' }} />
                <Typography variant="h6" fontWeight={600} lineHeight="1.5rem" sx={{ my: "0.5rem" }}>{v.name}</Typography>
                <Typography variant='caption' style={{ fontWeight: "500", fontSize: "16px" }}>{v.category}</Typography>
                <Typography variant="body2" sx={{
                  mt: "0.5rem",
                  display: '-webkit-box',
                  WebkitLineClamp: 5,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>{v.description}</Typography>
              </div>
              <div style={{ display: "flex", justifyContent: "center", marginTop: "0rem" }}>
                <Button type="submit" variant="contained" color="primary" sx={{ backgroundColor: "black", borderRadius: "10px", padding: "10px", fontWeight: "500", fontSize: "18px" }}
                  onClick={() => handleOpen(v)}
                >
                  View Course
                </Button>
              </div>
            </Card>
          </Grid>
        ))}
      </Grid>

      <OpenCoursespop
        open={open}
        handleClose={handleClose}
        selectedCourse={selectedCourse}
      />
    </Box>
  )
}