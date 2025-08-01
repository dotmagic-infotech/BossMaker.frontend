import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const PermissionRoute = ({ slug, action = "view", children }) => {
    const { user } = useAuth();
    const location = useLocation();

    const token = localStorage.getItem("bossmaker");

    // If user is not logged in
    if (!token) {
        return <Navigate to="/admin/signin" state={{ from: location }} replace />;
    }

    // admin cannot access module
    if (user?.user_type === 1 && slug === "participants") {
        return <Navigate to="/admin/access-denied" state={{ from: location }} replace />;
    }
    if (user?.user_type === 1 && slug === "studentCourses") {
        return <Navigate to="/admin/access-denied" state={{ from: location }} replace />;
    }

    // Always allow Super Admin
    if (user?.user_type === 1) return children;

    // Allow dashboard view
    if (slug === "dashboard") return children;

    const moduleKey = slug.charAt(0).toUpperCase() + slug.slice(1);
    const permissions = user?.permission?.[moduleKey];

    const hasPermission = permissions?.some(
        (perm) => perm.action === action && perm.is_access
    );

    if (hasPermission) {
        return children;
    }

    return <Navigate to="/admin/access-denied" state={{ from: location }} replace />;
};

export default PermissionRoute;