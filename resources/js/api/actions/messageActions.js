import {messageUrls} from '@/api/urls';

const getMessages = (chatId, query = null) => {
    if (typeof query === 'string' && query.trim() !== '') {
        const separator = messageUrls.index(chatId).includes('?') ? '&' : '?';
        return window.axios.get(`${messageUrls.index(chatId)}${separator}${query}`);
    } else if (query && typeof query === 'object') {
        return window.axios.get(messageUrls.index(chatId), { params: query });
    }
    return window.axios.get(messageUrls.index(chatId));
};

const createMessage = (payload) => window.axios.post(messageUrls.store, payload);
const updateMessage = (messageId, payload) => window.axios.put(messageUrls.update(messageId), payload);
const deleteMessage = (messageId) => window.axios.delete(messageUrls.destroy(messageId));

export default {
    getMessages,
    createMessage,
    updateMessage,
    deleteMessage,
};
