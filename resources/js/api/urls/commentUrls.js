const commentUrls = {
    index: (commentableType, commentableId) => `/${commentableType}/${commentableId}/comments`,
    show: (commentId) => `/comments/${commentId}`,
    store: (commentableType, commentableId) => `/${commentableType}/${commentableId}/comments`,
    update: (commentId) => `/comments/${commentId}`,
    destroy: (commentId) => `/comments/${commentId}`,
    replies: (commentId) => `/comments/${commentId}/replies`,
    userComments: '/user/comments',
};

export default commentUrls;
