// React Imports
import { createContext, useContext, useState, useEffect } from "react";

// Custom Component
import { useApiRequest } from "../components/UseApiRequest/useApiRequest";

const CategoryContext = createContext();

export const useCategory = () => useContext(CategoryContext);

export const CategoryProvider = ({ children }) => {

    // Hooks
    const apiRequest = useApiRequest();

    // State
    const [categoryData, setCategoryData] = useState([]);
    const [instructors, setInstructors] = useState([]);
    const [participants, setParticipants] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const { status, error, data } = await apiRequest(`/api/categories/usercategory`, 'GET');
            if (status === 200) {
                setCategoryData(data?.data || []);
            } else {
                setCategoryData([]);
            }
        } catch (error) {
            console.log("Failed to fetch categories:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchInstructors = async () => {
        setLoading(true);
        try {
            const { status, error, data } = await apiRequest(`/api/user/instructors`, 'GET');
            if (status === 200) {
                setInstructors(data?.data || []);
            } else {
                setInstructors([]);
            }
        } catch (error) {
            console.log("Failed to fetch instructors:", error);
        } finally {
            setLoading(false);
        }
    };
   
    const fetchParticipants = async () => {
        setLoading(true);
        try {
            const { status, error, data } = await apiRequest(`/api/user/participants`, 'GET');
            if (status === 200) {
                setParticipants(data?.data || []);
            } else {
                setParticipants([])
            }
        } catch (error) {
            console.log("Failed to fetch participants:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <CategoryContext.Provider value={{ categoryData, setCategoryData, loading, refetchCategories: fetchCategories, instructors, refetchInstructors: fetchInstructors, participants, refetchParticipants: fetchParticipants }}>
            {children}
        </CategoryContext.Provider>
    );
};
