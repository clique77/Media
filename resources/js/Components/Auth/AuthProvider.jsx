import React, {createContext, useContext, useEffect, useMemo, useState} from 'react';
import { useNavigate } from 'react-router-dom';
import {authActions, userActions, userStatusActions} from "@/api/actions";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const isAuthenticated = useMemo(() => !!user, [user]);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        const fetchUser = async () => {
            try {
                const response = await userActions.getMe();
                setUser(response.data);
                localStorage.setItem('user', JSON.stringify(response.data));
            } catch (error) {
                setUser(null);
                localStorage.removeItem('user');
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, []);

    const login = async (credentials) => {
        const response = await authActions.login(credentials);
        const { access_token, user } = response.data;
        localStorage.setItem('access_token', access_token);
        localStorage.setItem('user', JSON.stringify(user));
        setUser(user);
    };

    const logout = async () => {
        await userStatusActions.setUserOffline();
        await authActions.logout();
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        setUser(null);
        window.location.href = '/';
    };

    const register = async (userData) => {
        const response = await authActions.register(userData);
        const accessToken = response.data.access_token;
        localStorage.setItem('access_token', accessToken);
        setUser(response.data.user);
    };

    return (
        <AuthContext.Provider value={{ user, setUser, login, logout, register, loading, isAuthenticated }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
