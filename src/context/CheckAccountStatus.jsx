import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useApiRequest } from '../components/UseApiRequest/useApiRequest';

const CheckAccountStatus = ({ children }) => {

    // Hooks
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const apiRequest = useApiRequest();

    const verifyStatus = async () => {
        try {
            const { data, status, error } = await apiRequest(`/api/user/status/${user?.id}`, 'GET');
            if (status === 200) {
                if (data?.isActive === false) {
                    showToast(data?.message, "error");
                    logout();
                    navigate('/admin/signin', { replace: true });
                }
            } else {
                logout();
                navigate('/admin/signin', { replace: true });
                showToast(error, "error");
            }
        } catch (error) {
            logout();
            navigate('/admin/signin', { replace: true });
        }
    };

    useEffect(() => {
        if (user?.id) {
            verifyStatus();
        }
    }, [user?.id, logout, navigate]);

    return children;
};

export default CheckAccountStatus;
