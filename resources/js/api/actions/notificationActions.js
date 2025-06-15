import { notificationUrls } from '@/api/urls';

const getNotifications = (query = null) => {
    if (typeof query === 'string' && query.trim() !== '') {
        const separator = notificationUrls.index.includes('?') ? '&' : '?';
        return window.axios.get(`${notificationUrls.index}${separator}${query}`);
    } else if (query && typeof query === 'object') {
        return window.axios.get(notificationUrls.index, { params: query });
    }
    return window.axios.get(notificationUrls.index);
};

const markAllAsRead = () => window.axios.post(notificationUrls.markAllAsRead);

const markSingleAsRead = (notificationId) => window.axios.post(notificationUrls.markSingleAsRead(notificationId));

const deleteNotification = (notificationId) => window.axios.delete(notificationUrls.delete(notificationId));

export default {
    getNotifications,
    markAllAsRead,
    markSingleAsRead,
    deleteNotification
};
