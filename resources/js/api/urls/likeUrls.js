const likeUrls = {
    store: (likeableType, likeableId) => `/${likeableType}/${likeableId}/likes`,
    destroy: (likeId) => `/likes/${likeId}`,
    userLikes: () => `/user/likes`,
};

export default likeUrls;
