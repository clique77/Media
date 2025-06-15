import {chatUrls} from '@/api/urls';
const getChats = (query = null) => {
    if (typeof query === 'string' && query.trim() !== '') {
        const separator = chatUrls.index.includes('?') ? '&' : '?';
        return window.axios.get(`${chatUrls}${separator}${query}`);
    } else if (query && typeof query === 'object') {
        return window.axios.get(chatUrls.index, { params: query });
    }
    return window.axios.get(chatUrls.index);
};
const getChat = (chatId) => window.axios.get(chatUrls.show(chatId));
const createChat = (payload) => window.axios.post(chatUrls.store, payload);
const updateChat = (chatId, payload) => window.axios.put(chatUrls.update(chatId), payload);
const deleteChat = (chatId) => window.axios.delete(chatUrls.destroy(chatId));

export default {
    getChats,
    getChat,
    createChat,
    updateChat,
    deleteChat,
};
