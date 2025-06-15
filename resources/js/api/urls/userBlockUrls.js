const BASE_URL = '/user-blocks';

const userBlockUrls = {
    index: BASE_URL,
    store: BASE_URL,
    destroy: (userBlockId) => `${BASE_URL}/${userBlockId}`,
};

export default userBlockUrls;
