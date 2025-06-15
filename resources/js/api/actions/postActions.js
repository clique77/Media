import { postUrls } from '@/api/urls';

const getPosts = (query = null) => {
    if (typeof query === 'string' && query.trim() !== '') {
        const separator = postUrls.index.includes('?') ? '&' : '?';
        return window.axios.get(`${postUrls.index}${separator}${query}`);
    } else if (query && typeof query === 'object') {
        return window.axios.get(postUrls.index, { params: query });
    }
    return window.axios.get(postUrls.index);
};
const getPost = (identifier) => window.axios.get(postUrls.show(identifier));
const createPost = (payload) => window.axios.post(postUrls.store, payload);
const updatePost = (postId, payload) => window.axios.post(postUrls.update(postId), payload);
const deletePost = (postId) => window.axios.delete(postUrls.destroy(postId));

export default {
    getPosts,
    getPost,
    createPost,
    updatePost,
    deletePost,
};
