// React Imports
import { createContext, useContext, useEffect, useState } from 'react';

// Third Party Imports
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

    // State
    const [user, setUser] = useState(null);

    useEffect(() => {
        const checkAuth = () => {
            const token = localStorage.getItem("bossmaker");
            if (token) {
                try {
                    const decoded = jwtDecode(token);
                    setUser(decoded);
                    console.log("Login User ->", decoded)
                } catch (err) {
                    console.error("Invalid token:", err);
                    localStorage.removeItem("bossmaker");
                    setUser(null);
                }
            }
        };

        checkAuth();
    }, []);

    const login = (token) => {
        localStorage.setItem("bossmaker", token);
        const decoded = jwtDecode(token);
        setUser(decoded);
    };

    const logout = () => {
        localStorage.removeItem("bossmaker");
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
