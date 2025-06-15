import { likeUrls } from '@/api/urls';

const createLike = (likeableType, likeableId) =>
    window.axios.post(likeUrls.store(likeableType, likeableId));

const deleteLike = (likeId) =>
    window.axios.delete(likeUrls.destroy(likeId));

const getUserLikes = (query = null) => {
    if (typeof query === 'string' && query.trim() !== '') {
        const separator = likeUrls.userLikes().includes('?') ? '&' : '?';
        return window.axios.get(`${likeUrls.userLikes()}${separator}${query}`);
    } else if (query && typeof query === 'object') {
        return window.axios.get(likeUrls.userLikes(), { params: query });
    }
    return window.axios.get(likeUrls.userLikes());
};

export default {
    createLike,
    deleteLike,
    getUserLikes
};
