// React Imports
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// Icons
import GridViewIcon from '@mui/icons-material/GridView';
import PeopleIcon from '@mui/icons-material/People';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import WestOutlinedIcon from '@mui/icons-material/WestOutlined';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';

// Mui Imports
import { Avatar, Box, IconButton, Typography } from '@mui/material';

// Custom Component
import { useAuth } from '../../context/AuthContext';

// AppUtils
import { stringAvatar } from '../../utils/appUtils';

const Sidebar = () => {

  // Hooks
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const SIDEBARLIST = [
    {
      slug: "dashboard",
      name: "Dashboard",
      icon: <GridViewIcon />,
      navigate: "/admin/dashboard"
    },
    {
      slug: "category",
      name: "Category",
      icon: <CategoryOutlinedIcon />,
      navigate: "/admin/category"
    },
    {
      slug: "role",
      name: "Roles & Permissions",
      icon: <PeopleIcon />,
      navigate: "/admin/role-user"
    },
    {
      slug: "participants",
      name: "Participants",
      icon: <PeopleIcon />,
      navigate: "/admin/participant"
    },
    {
      slug: "course",
      name: "Course",
      icon: <SchoolOutlinedIcon />,
      navigate: "/admin/course"
    },
    {
      slug: "studentCourses",
      name: "Courses",
      icon: <SchoolOutlinedIcon />,
      navigate: "/admin/courses"
    },
  ]

  return (
    <div style={{ minWidth: "240px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", height: "75px" }}>
        <Typography className="logo" style={{ fontSize: "25px", fontWeight: "700", width: "100%", textAlign: "center" }}>
          BOSS MAKER
        </Typography>
      </div>
      <div style={{ padding: "4px", display: "flex", flexDirection: "column", gap: "2px", height: "calc(100% - 9.8rem)" }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography sx={{ fontWeight: "500", padding: "10px 0 0 10px", color: "rgb(112, 112, 112)" }}>Menu</Typography>
          <IconButton onClick={() => navigate(-1)}>
            <WestOutlinedIcon />
          </IconButton>
        </Box>
        {SIDEBARLIST.map((v, i) => {
          const isActive = location.pathname === v.navigate;

          const isSuperAdmin = user?.user_type === 1;

          if (v.slug === "participants" && isSuperAdmin) return null;
          if (v.slug === "studentCourses" && isSuperAdmin) return null;

          // Force show Dashboard always
          if (v.slug === "dashboard") {
            return (
              <li
                key={i}
                className={isActive ? 'sidebar-list-select' : 'sidebar-list'}
                onClick={() => navigate(v.navigate)}
              >
                {v.icon}
                <Typography fontWeight={500}>{v.name}</Typography>
              </li>
            );
          }

          const moduleKey = v.slug.charAt(0).toUpperCase() + v.slug.slice(1);
          const modulePermissions = user?.permission?.[moduleKey];

          const hasViewPermission = modulePermissions?.some(
            (perm) => perm.action === "view" && perm.is_access
          );

          if (!isSuperAdmin && !hasViewPermission) return null;

          return (
            <li
              key={i}
              className={isActive ? 'sidebar-list-select' : 'sidebar-list'}
              onClick={() => navigate(v.navigate)}
            >
              {v.icon}
              <Typography fontWeight={500}>{v.name}</Typography>
            </li>
          );
        })}
      </div>
      <Box sx={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px" }}>
        <Avatar src={user?.profile_image} {...stringAvatar(`${user?.first_name} ${user?.last_name}`)} sx={{ width: "50px", height: "50px", bgcolor: "white", color: "black", fontWeight: '600' }} />
        <Box>
          <Typography style={{ fontSize: "12px" }}>Good Day</Typography>
          <Typography sx={{ fontWeight: "600" }}>{user?.first_name} {user?.last_name}</Typography>
        </Box>
      </Box>
    </div>
  );
};

export default Sidebar;
