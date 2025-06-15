import {userUrls} from '@/api/urls';
const getUsers = (query = null) => {
    if (typeof query === 'string' && query.trim() !== '') {
        const separator = userUrls.index.includes('?') ? '&' : '?';
        return window.axios.get(`${userUrls.index}${separator}${query}`);
    } else if (query && typeof query === 'object') {
        return window.axios.get(userUrls.index, { params: query });
    }
    return window.axios.get(userUrls.index)
};
const getUser = (identifier) => window.axios.get(userUrls.show(identifier));
const updateUser = (userId, payload) => window.axios.post(userUrls.update(userId), payload);
const deleteUser = (userId) => window.axios.delete(userUrls.delete(userId));
const getMe = () => window.axios.get(userUrls.me);
const getTopUsers = () => window.axios.get(userUrls.top);

export default {
    getUsers,
    getUser,
    updateUser,
    deleteUser,
    getMe,
    getTopUsers
};
