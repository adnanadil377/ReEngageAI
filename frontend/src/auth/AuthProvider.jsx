// AuthProvider.js
import { useEffect, useMemo, useState } from "react";
import AuthContext from "./AuthContext";
import axios from "axios";

const decodeJwt = (token) => {
    try {
        return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
        console.error("Failed to decode JWT:", e);
        return null;
    }
};

const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem('authToken'));
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Define logout here so it can be used in the interceptor's dependency array if re-enabled
    const logout = useMemo(() => () => {
        localStorage.removeItem('authToken');
        setToken(null);
        setUser(null);
        delete axios.defaults.headers.common['Authorization'];
        // Optionally, redirect or notify user
        // window.location.href = '/login'; // Example redirect
        console.log("User logged out.");
    }, []); // Empty dependency array means logout itself doesn't change

    // Axios interceptor for handling 401 errors (e.g., token expiry)
    useEffect(() => {
        const responseInterceptor = axios.interceptors.response.use(
            response => response,
            error => {
                if (error.response && error.response.status === 401) {
                    // Avoid an infinite loop of logout calls if /auth/login itself returns 401
                    if (error.config.url !== 'http://localhost:8000/auth/login') {
                        console.log("Token expired or invalid. Logging out via interceptor.");
                        logout();
                    }
                }
                return Promise.reject(error);
            }
        );

        return () => {
            axios.interceptors.response.eject(responseInterceptor);
        };
    }, [logout]); // Rerun if logout function instance changes (it won't with useMemo above)


    useEffect(() => {
        const storedToken = localStorage.getItem('authToken');
        if (storedToken) {
            const decodedUser = decodeJwt(storedToken);
            // Check if token is expired
            if (decodedUser && decodedUser.exp * 1000 > Date.now()) {
                setToken(storedToken);
                setUser(decodedUser); // User data from JWT claims
                axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
            } else {
                // Token exists but is expired or invalid
                localStorage.removeItem('authToken');
                setUser(null);
                delete axios.defaults.headers.common['Authorization'];
                if (decodedUser) console.log("Stored token was expired.");
            }
        }
        setLoading(false);
    }, []); // Run only on component mount

    const login = async (email, password) => {
        try {
            // Create form data
            const formData = new URLSearchParams();
            formData.append('username', email); // FastAPI's OAuth2PasswordRequestForm expects 'username'
            formData.append('password', password);
            // formData.append('grant_type', 'password'); // Usually not needed for OAuth2PasswordRequestForm, but can be explicit

            const response = await axios.post(
                "http://localhost:8000/auth/login",
                formData, // Send as URLSearchParams
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }
            );

            // Backend returns: {"access_token": "...", "token_type": "bearer"}
            const { access_token: newToken } = response.data;

            if (newToken) {
                localStorage.setItem('authToken', newToken);
                setToken(newToken);
                const decodedUser = decodeJwt(newToken);
                setUser(decodedUser); // Set user from decoded token claims
                axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
                return { success: true, user: decodedUser };
            }
            // Should not happen if backend behaves correctly on success
            return { success: false, error: 'Login successful, but no token received in response.' };

        } catch (error) {
            console.error("Login error:", error.response || error.message);
            const errorMessage = error.response?.data?.detail || error.message || 'Login failed due to an unknown error.';
            return { success: false, error: errorMessage };
        }
    };

    // logout is already defined with useMemo above

    const contextValue = useMemo(
        () => ({
            token,
            user,
            isAuthenticated: !!token,
            loading,
            login,
            logout,
        }),
        [token, user, loading, login, logout] // Add login and logout to dependencies
    );

    return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

export default AuthProvider;