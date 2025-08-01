// React Imports
import { Navigate, Outlet } from 'react-router-dom';

// Custom Components
import { CategoryProvider } from '../../context/CategoryContext';
import CheckAccountStatus from '../../context/CheckAccountStatus';

const ProtectedRoute = () => {

    const token = localStorage.getItem('bossmaker');

    if (!token) {
        return <Navigate to="/admin/signin" replace />;
    }

    return (
        <CheckAccountStatus>
            <CategoryProvider>
                <Outlet />
            </CategoryProvider>
        </CheckAccountStatus>
    );
};

export default ProtectedRoute;
