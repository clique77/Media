const BASE_URL = '/posts';

const postUrls = {
    index: `${BASE_URL}`,
    show: (identifier) => `${BASE_URL}/${identifier}`,
    store: `${BASE_URL}`,
    update: (postId) => `${BASE_URL}/${postId}`,
    destroy: (postId) => `${BASE_URL}/${postId}`,
};

export default postUrls;
