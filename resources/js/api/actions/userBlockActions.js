import {userBlockUrls} from '@/api/urls';

const getUserBlocks = (query = null) => {
    if (typeof query === 'string' && query.trim() !== '') {
        const separator = userBlockUrls.index.includes('?') ? '&' : '?';
        return window.axios.get(`${userBlockUrls.index}${separator}${query}`);
    } else if (query && typeof query === 'object') {
        return window.axios.get(userBlockUrls.index, { params: query });
    }
    return window.axios.get(userBlockUrls.index)
};
const createUserBlock = (payload) => window.axios.post(userBlockUrls.store, payload);
const deleteUserBlock = (userBlockId) => window.axios.delete(userBlockUrls.destroy(userBlockId));

export default {
    getUserBlocks,
    createUserBlock,
    deleteUserBlock,
};
