const BASE_URL = '/chats';

const chatUrls = {
    index: `${BASE_URL}`,
    store: `${BASE_URL}`,
    show: (chatId) => `${BASE_URL}/${chatId}`,
    update: (chatId) => `${BASE_URL}/${chatId}`,
    destroy: (chatId) => `${BASE_URL}/${chatId}`,
};

export default chatUrls;
