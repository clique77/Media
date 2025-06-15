const messageUrls = {
    index: (chatId) => `/chats/${chatId}/messages`,
    store: '/messages',
    update: (messageId) => `/messages/${messageId}`,
    destroy: (messageId) => `/messages/${messageId}`,
};

export default messageUrls;
