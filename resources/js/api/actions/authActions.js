import { authUrls } from '@/api/urls';

const register = (payload) => window.axios.post(authUrls.register, payload);
const login = (payload) => window.axios.post(authUrls.login, payload);
const logout = () => window.axios.post(authUrls.logout);
const refreshToken = () => window.axios.post(authUrls.refreshToken);

export default {
    register,
    login,
    logout,
    refreshToken,
};
