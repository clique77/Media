const BASE_URL = '/users';

const userUrls = {
    index: BASE_URL,
    show: (identifier) => `${BASE_URL}/${identifier}`,
    update: (userId) => `${BASE_URL}/${userId}`,
    delete: (userId) => `${BASE_URL}/${userId}`,
    me: `${BASE_URL}/me`,
    top: `${BASE_URL}/top`,
};

export default userUrls;
