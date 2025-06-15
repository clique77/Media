import {commentUrls, postUrls} from '@/api/urls';

const getComments = (commentableType, commentableId, query = null) => {
    if (typeof query === 'string' && query.trim() !== '') {
        const separator = commentUrls.index(commentableType, commentableId).includes('?') ? '&' : '?';
        return window.axios.get(`${commentUrls.index(commentableType, commentableId)}${separator}${query}`);
    } else if (query && typeof query === 'object') {
        return window.axios.get(commentUrls.index(commentableType, commentableId), { params: query });
    }
    return window.axios.get(commentUrls.index(commentableType, commentableId));
};
const getComment = (commentId) =>
    window.axios.get(commentUrls.show(commentId));

const createComment = (commentableType, commentableId, payload) =>
    window.axios.post(commentUrls.store(commentableType, commentableId), payload);

const updateComment = (commentId, payload) =>
    window.axios.put(commentUrls.update(commentId), payload);

const deleteComment = (commentId) =>
    window.axios.delete(commentUrls.destroy(commentId));

const getReplies = (commentId, query = null) => {
    if (typeof query === 'string' && query.trim() !== '') {
        const separator = commentUrls.replies(commentId).includes('?') ? '&' : '?';
        return window.axios.get(`${commentUrls.replies(commentId)}${separator}${query}`);
    } else if (query && typeof query === 'object') {
        return window.axios.get(commentUrls.replies(commentId), { params: query });
    }
    return window.axios.get(commentUrls.replies(commentId));
};

export default {
    getComments,
    getComment,
    createComment,
    updateComment,
    deleteComment,
    getReplies,
};
